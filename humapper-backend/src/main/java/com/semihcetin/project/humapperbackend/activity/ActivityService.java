package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.sector.Sector;
import com.semihcetin.project.humapperbackend.sector.SectorRepository;
import com.semihcetin.project.humapperbackend.settings.MapVisibility;
import com.semihcetin.project.humapperbackend.settings.SettingsService;
import com.semihcetin.project.humapperbackend.user.Organization;
import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserRepository;
import org.locationtech.jts.geom.Geometry;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.access.AccessDeniedException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ActivityService {
    private final ActivityRepository activities;
    private final UserRepository users;
    private final SectorRepository sectors;
    private final SettingsService settings;

    public ActivityService(ActivityRepository activities, UserRepository users,
                           SectorRepository sectors, SettingsService settings) {
        this.activities = activities;
        this.users = users;
        this.sectors = sectors;
        this.settings = settings;
    }

    @Transactional
    public ActivityResponse create(CreateActivityRequest req, Long currentUserId) {
        User user = users.findById(currentUserId)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));
        Organization org = user.getOrganization();
        if (org == null) {
            throw new IllegalStateException("User is not linked to an organization");
        }

        Geometry geom = req.geometry();
        geom.setSRID(4326);

        Set<Sector> sectorSet = new HashSet<>(sectors.findAllById(req.sectorIds()));

        Activity activity = Activity.builder()
                .organization(org)
                .geom(geom)
                .status(req.status())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .targetPeople(req.targetPeople())
                .description(req.description())
                .sectors(sectorSet)
                .build();

        return ActivityResponse.from(activities.save(activity));
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> findAll() {
        return activities.findAll().stream().map(ActivityResponse::from).toList();
    }

    // Applies the coordinator's map-visibility setting.
    // APPROVED_ONLY: everyone sees approved activities; org members also see their own org's
    // in-progress ones; coordinators always see everything.
    @Transactional(readOnly = true)
    public List<ActivityResponse> findVisible(Authentication auth) {
        boolean coordinator = auth != null && auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_COORDINATOR"));

        if (settings.currentMapVisibility() == MapVisibility.ALL || coordinator) {
            return findAll();
        }

        Long myOrgId = auth == null ? null : users.findById(Long.valueOf(auth.getName()))
                .map(User::getOrganization)
                .map(Organization::getId)
                .orElse(null);

        return activities.findAll().stream()
                .filter(a -> a.getReviewStatus() == ReviewStatus.APPROVED
                        || (myOrgId != null && a.getOrganization().getId().equals(myOrgId)))
                .map(ActivityResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ActivityResponse findById(Long id) {
        Activity activity = activities.findById(id)
                .orElseThrow(() -> new ActivityNotFoundException(id));
        return ActivityResponse.from(activity);
    }

    @Transactional
    public ActivityResponse update(Long id, CreateActivityRequest req, Long currentUserId) {
        Activity activity = activities.findById(id)
                .orElseThrow(() -> new ActivityNotFoundException(id));

        requireOwnership(activity, currentUserId);

        Geometry geom = req.geometry();
        geom.setSRID(4326);
        activity.setGeom(geom);
        activity.setStatus(req.status());
        activity.setStartDate(req.startDate());
        activity.setEndDate(req.endDate());
        activity.setTargetPeople(req.targetPeople());
        activity.setDescription(req.description());
        activity.setSectors(new HashSet<>(sectors.findAllById(req.sectorIds())));

        return ActivityResponse.from(activity);
    }

    @Transactional
    public void delete(Long id, Long currentUserId) {
        Activity activity = activities.findById(id)
                .orElseThrow(() -> new ActivityNotFoundException(id));

        requireOwnership(activity, currentUserId);
        activities.delete(activity);
    }

    @Transactional
    public ActivityResponse submit(Long id, Long currentUserId) {
        Activity a = activities.findById(id).orElseThrow(() -> new ActivityNotFoundException(id));
        requireOwnership(a, currentUserId);
        if (a.getReviewStatus() != ReviewStatus.DRAFT && a.getReviewStatus() != ReviewStatus.NEEDS_UPDATE) {
            throw new IllegalStateException("Only draft or needs-update activities can be submitted");
        }
        a.setReviewStatus(ReviewStatus.SUBMITTED);
        return ActivityResponse.from(a);
    }

    @Transactional
    public ActivityResponse approve(Long id) {
        Activity a = activities.findById(id).orElseThrow(() -> new ActivityNotFoundException(id));
        if (a.getReviewStatus() != ReviewStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted activities can be approved");
        }
        a.setReviewStatus(ReviewStatus.APPROVED);
        return ActivityResponse.from(a);
    }

    @Transactional
    public ActivityResponse requestChanges(Long id) {
        Activity a = activities.findById(id).orElseThrow(() -> new ActivityNotFoundException(id));
        if (a.getReviewStatus() != ReviewStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted activities can be sent back");
        }
        a.setReviewStatus(ReviewStatus.NEEDS_UPDATE);
        return ActivityResponse.from(a);
    }

    private void requireOwnership(Activity activity, Long currentUserId) {
        User user = users.findById(currentUserId)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));
        Organization org = user.getOrganization();

        if (org == null || !activity.getOrganization().getId().equals(org.getId())) {
            throw new AccessDeniedException("Not your organization's activity");
        }
    }
}
