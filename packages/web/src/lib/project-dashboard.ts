import type { FeedItem, Presence } from "@csf-live/shared";

type ProjectContentItem = Extract<FeedItem, { _sourceTable: "content_item" }>;

export function getProjectPresence(presenceList: Presence[], slug: string): Presence[] {
	return presenceList.filter(
		({ status, currentLocation }) => status === "online" && currentLocation.includes(slug),
	);
}

export function getRecentContentItems(recentItems: FeedItem[]): ProjectContentItem[] {
	return recentItems
		.filter((item): item is ProjectContentItem => item._sourceTable === "content_item")
		.slice(0, 5);
}

export function getRecentContentTitle(
	item: Pick<ProjectContentItem, "title" | "metadata">,
): string {
	const metadataTitle = item.metadata.title;
	return item.title ?? (typeof metadataTitle === "string" ? metadataTitle : null) ?? "Untitled";
}
