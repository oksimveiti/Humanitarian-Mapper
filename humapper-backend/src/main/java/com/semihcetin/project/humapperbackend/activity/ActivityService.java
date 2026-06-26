package com.semihcetin.project.humapperbackend.activity;

import com.semihcetin.project.humapperbackend.sector.Sector;
import com.semihcetin.project.humapperbackend.sector.SectorRepository;
import com.semihcetin.project.humapperbackend.user.Organization;
import com.semihcetin.project.humapperbackend.user.User;
import com.semihcetin.project.humapperbackend.user.UserRepository;
import org.locationtech.jts.geom.Geometry;
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

    public ActivityService(ActivityRepository activities, UserRepository users, SectorRepository sectors) {
        this.activities = activities;
        this.users = users;
        this.sectors = sectors;
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

    private void requireOwnership(Activity activity, Long currentUserId) {
        User user = users.findById(currentUserId)
                .orElseThrow(() -> new IllegalStateException("Current user not found"));
        Organization org = user.getOrganization();

        if (org == null || !activity.getOrganization().getId().equals(org.getId())) {
            throw new AccessDeniedException("Not your organization's activity");
        }
    }
}
