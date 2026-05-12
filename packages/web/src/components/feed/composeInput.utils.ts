import type { ContentItem } from "@csf-live/shared";
import { CURRENT_USER_ID } from "@csf-live/shared/constants";

type CreateContentItemInput = Omit<
	ContentItem,
	"id" | "status" | "version" | "createdAt" | "updatedAt" | "deletedAt"
>;

type ProjectId = string | null | undefined;

function buildHumanContentItem(
	fields: Omit<
		CreateContentItemInput,
		"source" | "sourceDetail" | "projectId" | "sectionId" | "parentId" | "authorId"
	>,
	projectId: ProjectId,
): CreateContentItemInput {
	return {
		...fields,
		source: "human",
		sourceDetail: null,
		projectId: projectId ?? null,
		sectionId: null,
		parentId: null,
		authorId: CURRENT_USER_ID,
	};
}

export function isSupportedUrl(text: string): boolean {
	try {
		const url = new URL(text.trim());
		return url.protocol === "http:" || url.protocol === "https:";
	} catch {
		return false;
	}
}

export function buildLinkContentItem(
	urlText: string,
	projectId: ProjectId,
): CreateContentItemInput {
	const url = new URL(urlText);

	return buildHumanContentItem(
		{
			type: "link",
			title: null,
			body: null,
			mediaUrl: urlText,
			mediaType: null,
			metadata: {
				title: urlText,
				description: null,
				favicon: null,
				ogImage: null,
				domain: url.hostname,
			},
		},
		projectId,
	);
}

export function buildVoiceContentItem(
	blobUrl: string,
	durationMs: number,
	projectId: ProjectId,
): CreateContentItemInput {
	return buildHumanContentItem(
		{
			type: "voice",
			title: "Voice note",
			body: null,
			mediaUrl: blobUrl,
			mediaType: "audio/webm",
			metadata: { duration: durationMs },
		},
		projectId,
	);
}

export function buildPhotoContentItem(
	file: File,
	blobUrl: string,
	projectId: ProjectId,
): CreateContentItemInput {
	return buildHumanContentItem(
		{
			type: "photo",
			title: file.name || "Photo",
			body: null,
			mediaUrl: blobUrl,
			mediaType: file.type,
			metadata: {},
		},
		projectId,
	);
}

export function buildFileContentItem(
	file: File,
	blobUrl: string,
	projectId: ProjectId,
): CreateContentItemInput {
	return buildHumanContentItem(
		{
			type: "file",
			title: file.name,
			body: null,
			mediaUrl: blobUrl,
			mediaType: file.type,
			metadata: {
				fileName: file.name,
				fileSize: file.size,
				mimeType: file.type,
			},
		},
		projectId,
	);
}
