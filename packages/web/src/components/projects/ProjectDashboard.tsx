import type { ProjectStatus } from "@csf-live/shared";
import {
	CONTENT_TYPE_LABELS,
	PROJECT_STATUS_COLORS,
	PROJECT_STATUS_LABELS,
} from "@csf-live/shared/constants";
import { Layers, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useProjectFeedItems } from "@/hooks/useFeed";
import { usePresence } from "@/hooks/usePresence";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import { useSections } from "@/hooks/useSections";
import {
	getProjectPresence,
	getRecentContentItems,
	getRecentContentTitle,
} from "@/lib/project-dashboard";
import { formatDistanceToNow } from "@/lib/time";
import { cn } from "@/lib/utils";
import { useMockStore } from "@/mocks/store";
import { CreateSectionDialog } from "./CreateSectionDialog";

interface ProjectDashboardProps {
	slug: string;
}

const STATUS_COLOR_CLASSES: Record<string, string> = {
	green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
	yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
	gray: "bg-warm-100 text-warm-500 dark:bg-warm-800 dark:text-warm-400",
	blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
};

export function ProjectDashboard({ slug }: ProjectDashboardProps) {
	const { data: project, isLoading } = useProject(slug);
	const { data: sections = [] } = useSections(project?.id ?? "");
	const { data: presenceList = [] } = usePresence();
	const { data: recentItems = [] } = useProjectFeedItems(project?.id ?? "");
	const { users } = useMockStore();
	const updateProject = useUpdateProject();

	const [editingTitle, setEditingTitle] = useState(false);
	const [title, setTitle] = useState("");
	const [editingDesc, setEditingDesc] = useState(false);
	const [description, setDescription] = useState("");
	const [showStatusMenu, setShowStatusMenu] = useState(false);
	const [showCreateSection, setShowCreateSection] = useState(false);

	const titleRef = useRef<HTMLInputElement>(null);
	const descRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (project) {
			setTitle(project.title);
			setDescription(project.description ?? "");
		}
	}, [project]);

	useEffect(() => {
		if (editingTitle && titleRef.current) titleRef.current.focus();
	}, [editingTitle]);

	useEffect(() => {
		if (editingDesc && descRef.current) descRef.current.focus();
	}, [editingDesc]);

	function handleTitleBlur() {
		setEditingTitle(false);
		if (project && title !== project.title && title.trim()) {
			updateProject.mutate({ projectId: project.id, patch: { title: title.trim() } });
		}
	}

	function handleDescBlur() {
		setEditingDesc(false);
		if (project && description !== (project.description ?? "")) {
			updateProject.mutate({
				projectId: project.id,
				patch: { description: description || undefined },
			});
		}
	}

	function handleStatusChange(status: ProjectStatus) {
		if (!project) return;
		setShowStatusMenu(false);
		updateProject.mutate({ projectId: project.id, patch: { status } });
	}

	if (isLoading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-sm text-warm-400 dark:text-warm-500">Loading…</div>
			</div>
		);
	}

	if (!project) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="text-sm text-warm-400 dark:text-warm-500">Project not found</div>
			</div>
		);
	}

	// Presence: users who are in this project
	const projectPresence = getProjectPresence(presenceList, slug);

	// Recent activity: last 5 content items (newest first, from recentItems which already sorted)
	const recentContentItems = getRecentContentItems(recentItems);

	const statusColor = PROJECT_STATUS_COLORS[project.status] ?? "gray";
	const statusClass = STATUS_COLOR_CLASSES[statusColor] ?? STATUS_COLOR_CLASSES.gray;

	return (
		<div className="flex h-full flex-col overflow-y-auto p-4 gap-5">
			{/* Title — inline editable */}
			<div>
				{editingTitle ? (
					<input
						ref={titleRef}
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						onBlur={handleTitleBlur}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleTitleBlur();
						}}
						className="w-full rounded-md border border-warm-300 bg-warm-50 px-2 py-1 text-lg font-semibold text-warm-900 focus:border-warm-500 focus:outline-none dark:border-warm-600 dark:bg-warm-800 dark:text-warm-100"
					/>
				) : (
					<h1 className="text-lg font-semibold">
						<button
							type="button"
							onClick={() => setEditingTitle(true)}
							className="cursor-text rounded-md px-2 py-1 text-lg font-semibold text-warm-900 transition-colors hover:bg-warm-100 dark:text-warm-100 dark:hover:bg-warm-800"
						>
							{project.title}
						</button>
					</h1>
				)}
			</div>

			{/* Description — inline editable */}
			<div>
				{editingDesc ? (
					<textarea
						ref={descRef}
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						onBlur={handleDescBlur}
						rows={3}
						className="w-full resize-none rounded-md border border-warm-300 bg-warm-50 px-2 py-1 text-sm text-warm-700 focus:border-warm-500 focus:outline-none dark:border-warm-600 dark:bg-warm-800 dark:text-warm-300"
					/>
				) : (
					<button
						type="button"
						onClick={() => setEditingDesc(true)}
						className={cn(
							"cursor-text rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-warm-100 dark:hover:bg-warm-800",
							description
								? "text-warm-600 dark:text-warm-400"
								: "text-warm-400 dark:text-warm-500 italic",
						)}
					>
						{description || "Add a description…"}
					</button>
				)}
			</div>

			{/* Status badge + dropdown */}
			<div className="relative">
				<button
					type="button"
					onClick={() => setShowStatusMenu((m) => !m)}
					className={cn(
						"rounded-full px-3 py-1 text-xs font-medium transition-colors",
						statusClass,
					)}
				>
					{PROJECT_STATUS_LABELS[project.status] ?? project.status}
				</button>
				{showStatusMenu && (
					<div className="absolute left-0 top-8 z-10 w-40 rounded-lg border border-warm-200 bg-white shadow-lg dark:border-warm-700 dark:bg-warm-900">
						{(["active", "paused", "archived", "completed"] as ProjectStatus[]).map((s) => (
							<button
								key={s}
								type="button"
								onClick={() => handleStatusChange(s)}
								className={cn(
									"w-full text-left px-3 py-2 text-sm transition-colors hover:bg-warm-50 dark:hover:bg-warm-800",
									project.status === s
										? "font-medium text-warm-900 dark:text-warm-100"
										: "text-warm-600 dark:text-warm-400",
								)}
							>
								{PROJECT_STATUS_LABELS[s]}
							</button>
						))}
					</div>
				)}
			</div>

			{/* Presence */}
			{projectPresence.length > 0 && (
				<div className="flex items-center gap-2">
					{projectPresence.map((p) => {
						const user = users.find((u) => u.id === p.userId);
						return (
							<div
								key={p.userId}
								className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-warm-400"
							>
								<span className="h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
								{user?.name ?? "Someone"} is here
							</div>
						);
					})}
				</div>
			)}

			{/* Sections */}
			<div>
				<div className="flex items-center justify-between mb-2">
					<div className="text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
						Sections
					</div>
					<button
						type="button"
						onClick={() => setShowCreateSection(true)}
						className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-warm-500 hover:bg-warm-100 dark:text-warm-400 dark:hover:bg-warm-800 transition-colors"
					>
						<Plus size={12} />
						Add
					</button>
				</div>
				{sections.length === 0 ? (
					<div className="text-xs text-warm-400 dark:text-warm-500 italic">No sections yet</div>
				) : (
					<div className="space-y-1">
						{sections.map((section) => (
							<div
								key={section.id}
								className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-warm-50 dark:hover:bg-warm-800 transition-colors cursor-pointer"
							>
								<Layers size={12} className="text-warm-400 dark:text-warm-500 flex-shrink-0" />
								<div className="min-w-0">
									<div className="text-sm font-medium text-warm-800 dark:text-warm-200 truncate">
										{section.title}
									</div>
									{section.description && (
										<div className="text-xs text-warm-500 dark:text-warm-400 truncate">
											{section.description}
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Recent activity */}
			{recentContentItems.length > 0 && (
				<div>
					<div className="mb-2 text-xs font-medium text-warm-500 dark:text-warm-400 uppercase tracking-wide">
						Recent Activity
					</div>
					<div className="space-y-2">
						{recentContentItems.map((item) => {
							if (item._sourceTable !== "content_item") return null;
							const author = users.find((u) => u.id === item.authorId);
							return (
								<div
									key={item.id}
									className="flex items-center gap-2 text-xs text-warm-600 dark:text-warm-400"
								>
									<span className="text-warm-400 dark:text-warm-500 capitalize">
										{CONTENT_TYPE_LABELS[item.type] ?? item.type}
									</span>
									<span className="truncate flex-1 text-warm-800 dark:text-warm-200">
										{getRecentContentTitle(item)}
									</span>
									<span className="flex-shrink-0 text-warm-400 dark:text-warm-500">
										{author?.name ?? "?"} · {formatDistanceToNow(new Date(item.createdAt))}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{showCreateSection && project && (
				<CreateSectionDialog projectId={project.id} onClose={() => setShowCreateSection(false)} />
			)}
		</div>
	);
}
