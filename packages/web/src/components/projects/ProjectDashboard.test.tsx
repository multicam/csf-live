import type { FeedItem, Presence, Project } from "@csf-live/shared";
import { describe, expect, it } from "vitest";
import { getProjectPresence, getRecentContentTitle } from "@/lib/project-dashboard";

// ─── Pure logic tests for presence filtering ─────────────────────────────────
// We test the filtering logic used in ProjectDashboard directly,
// without rendering the full component tree.

function makePresence(overrides: Partial<Presence> = {}): Presence {
	return {
		userId: "user-ben",
		status: "online",
		currentLocation: "project:project-csf-live",
		lastHeartbeat: new Date("2026-01-01T10:00:00Z"),
		...overrides,
	};
}

function makeProject(overrides: Partial<Project> = {}): Project {
	return {
		id: "project-csf-live",
		slug: "csf-live",
		title: "CSF Live",
		description: "The project",
		status: "active",
		createdBy: "user-jm",
		createdAt: new Date("2026-01-01T00:00:00Z"),
		updatedAt: new Date("2026-01-01T00:00:00Z"),
		...overrides,
	};
}

function makeContentItem(
	overrides: Partial<Extract<FeedItem, { _sourceTable: "content_item" }>> = {},
): Extract<FeedItem, { _sourceTable: "content_item" }> {
	return {
		_sourceTable: "content_item",
		id: "content-1",
		type: "link",
		title: null,
		body: null,
		mediaUrl: null,
		mediaType: null,
		metadata: {},
		source: "human",
		sourceDetail: null,
		projectId: "project-csf-live",
		sectionId: null,
		parentId: null,
		authorId: "user-jm",
		status: "active",
		version: 1,
		createdAt: new Date("2026-01-01T00:00:00Z"),
		updatedAt: new Date("2026-01-01T00:00:00Z"),
		deletedAt: null,
		...overrides,
	};
}

describe("ProjectDashboard — presence indicator logic", () => {
	it("shows presence when user currentLocation includes the project slug", () => {
		const project = makeProject({ slug: "csf-live" });
		const presenceList = [makePresence({ currentLocation: "project:project-csf-live" })];

		const result = getProjectPresence(presenceList, project.slug);

		expect(result).toHaveLength(1);
		expect(result[0].userId).toBe("user-ben");
	});

	it("presence indicator absent when user is in a different location", () => {
		const project = makeProject({ slug: "csf-live" });
		const presenceList = [makePresence({ currentLocation: "project:project-other" })];

		const result = getProjectPresence(presenceList, project.slug);

		expect(result).toHaveLength(0);
	});

	it("excludes offline users even if location matches", () => {
		const project = makeProject({ slug: "csf-live" });
		const presenceList = [
			makePresence({
				status: "offline",
				currentLocation: "project:project-csf-live",
			}),
		];

		const result = getProjectPresence(presenceList, project.slug);

		expect(result).toHaveLength(0);
	});

	it("returns multiple users when several are in the same project", () => {
		const project = makeProject({ slug: "csf-live" });
		const presenceList = [
			makePresence({ userId: "user-ben", currentLocation: "project:project-csf-live" }),
			makePresence({ userId: "user-jm", currentLocation: "project:project-csf-live" }),
		];

		const result = getProjectPresence(presenceList, project.slug);

		expect(result).toHaveLength(2);
	});

	it("absent when presence list is empty", () => {
		const project = makeProject({ slug: "csf-live" });
		const result = getProjectPresence([], project.slug);

		expect(result).toHaveLength(0);
	});
});

describe("ProjectDashboard — recent activity titles", () => {
	it("prefers item title when present", () => {
		expect(getRecentContentTitle(makeContentItem({ title: "Launch plan" }))).toBe("Launch plan");
	});

	it("falls back to metadata.title for link items", () => {
		expect(
			getRecentContentTitle(makeContentItem({ metadata: { title: "https://example.com/spec" } })),
		).toBe("https://example.com/spec");
	});

	it("uses Untitled when no title metadata is available", () => {
		expect(getRecentContentTitle(makeContentItem())).toBe("Untitled");
	});
});
