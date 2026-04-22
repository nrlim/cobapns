import { redirect } from "next/navigation"

/**
 * The lobby page is replaced by the ExamLobbyModal (popup) on /dashboard/exams.
 * If someone navigates here directly (bookmarks, back button), redirect them
 * to the exam list where the modal can be opened.
 */
export default async function ExamLobbyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Redirect to the exam list — the user can click Mulai to open the modal
  redirect(`/dashboard/exams`)
}
