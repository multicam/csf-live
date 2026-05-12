import type { ContentItem, Notification, Project, Section } from "@csf-live/shared";
import { ROUTES } from "@csf-live/shared/constants";

type NotificationRouteLookup = {
	projects: Pick<Project, "id" | "slug">[];
	sections: Pick<Section, "id" | "projectId">[];
	contentItems: Pick<ContentItem, "id" | "projectId">[];
};

export function getNotificationUrl(
	notification: Pick<Notification, "referenceType" | "referenceId">,
	{ projects, sections, contentItems }: NotificationRouteLookup,
): string {
	if (notification.referenceType === "project") {
		const project = projects.find(({ id }) => id === notification.referenceId);
		return project ? ROUTES.PROJECT_FEED(project.slug) : ROUTES.FEED;
	}

	if (notification.referenceType === "section") {
		const section = sections.find(({ id }) => id === notification.referenceId);
		if (!section) return ROUTES.FEED;

		const project = projects.find(({ id }) => id === section.projectId);
		return project
			? `${ROUTES.PROJECT_FEED(project.slug)}?section=${notification.referenceId}`
			: ROUTES.FEED;
	}

	if (notification.referenceType === "content_item") {
		const item = contentItems.find(({ id }) => id === notification.referenceId);
		if (!item?.projectId) return ROUTES.FEED;

		const project = projects.find(({ id }) => id === item.projectId);
		return project ? ROUTES.PROJECT_ITEM(project.slug, notification.referenceId) : ROUTES.FEED;
	}

	return ROUTES.FEED;
}

export function countUnreadNotifications(notifications: Pick<Notification, "read">[]): number {
	return notifications.filter(({ read }) => !read).length;
}

export function sortNotificationsByNewest<T extends Pick<Notification, "createdAt">>(
	notifications: T[],
): T[] {
	return [...notifications].sort(
		(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
	);
}
