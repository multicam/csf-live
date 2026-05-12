import { describe, expect, it } from "vitest";
import {
	buildFileContentItem,
	buildLinkContentItem,
	buildPhotoContentItem,
	buildVoiceContentItem,
	isSupportedUrl,
} from "./composeInput.utils";

describe("isSupportedUrl", () => {
	it("accepts http and https urls", () => {
		expect(isSupportedUrl("https://example.com/path")).toBe(true);
		expect(isSupportedUrl("http://example.com")).toBe(true);
	});

	it("rejects invalid or unsupported urls", () => {
		expect(isSupportedUrl("example.com")).toBe(false);
		expect(isSupportedUrl("ftp://example.com")).toBe(false);
		expect(isSupportedUrl("just text")).toBe(false);
	});
});

describe("buildLinkContentItem", () => {
	it("creates the expected payload for a link capture", () => {
		expect(buildLinkContentItem("https://example.com/docs?id=123", "project-1")).toEqual({
			type: "link",
			title: null,
			body: null,
			mediaUrl: "https://example.com/docs?id=123",
			mediaType: null,
			metadata: {
				title: "https://example.com/docs?id=123",
				description: null,
				favicon: null,
				ogImage: null,
				domain: "example.com",
			},
			source: "human",
			sourceDetail: null,
			projectId: "project-1",
			sectionId: null,
			parentId: null,
			authorId: "user-jm",
		});
	});
});

describe("buildVoiceContentItem", () => {
	it("creates the expected payload for a voice capture", () => {
		expect(buildVoiceContentItem("blob:voice-url", 3210, null)).toEqual({
			type: "voice",
			title: "Voice note",
			body: null,
			mediaUrl: "blob:voice-url",
			mediaType: "audio/webm",
			metadata: { duration: 3210 },
			source: "human",
			sourceDetail: null,
			projectId: null,
			sectionId: null,
			parentId: null,
			authorId: "user-jm",
		});
	});
});

describe("buildPhotoContentItem", () => {
	it("creates the expected payload for a photo capture", () => {
		const file = new File(["photo"], "image.png", { type: "image/png" });

		expect(buildPhotoContentItem(file, "blob:image-url", "project-1")).toEqual({
			type: "photo",
			title: "image.png",
			body: null,
			mediaUrl: "blob:image-url",
			mediaType: "image/png",
			metadata: {},
			source: "human",
			sourceDetail: null,
			projectId: "project-1",
			sectionId: null,
			parentId: null,
			authorId: "user-jm",
		});
	});
});

describe("buildFileContentItem", () => {
	it("creates the expected payload for a file upload", () => {
		const file = new File(["file"], "brief.pdf", { type: "application/pdf" });

		expect(buildFileContentItem(file, "blob:file-url", "project-1")).toEqual({
			type: "file",
			title: "brief.pdf",
			body: null,
			mediaUrl: "blob:file-url",
			mediaType: "application/pdf",
			metadata: {
				fileName: "brief.pdf",
				fileSize: file.size,
				mimeType: "application/pdf",
			},
			source: "human",
			sourceDetail: null,
			projectId: "project-1",
			sectionId: null,
			parentId: null,
			authorId: "user-jm",
		});
	});
});
