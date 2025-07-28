import { notFound } from "next/navigation"
import InviteRenderer from "@/components/invite-renderer"

async function getInvite(inviteId: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/invite/${inviteId}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching invite:", error)
    return null
  }
}

export default function InvitePage({ params }: { params: { inviteId: string } }) {
  return <InviteRenderer inviteId={params.inviteId} />
}

export async function generateMetadata({ params }: { params: { inviteId: string } }) {
  const inviteData = await getInvite(params.inviteId)

  if (!inviteData || !inviteData.success) {
    return {
      title: "Invite Not Found",
    }
  }

  const { formData } = inviteData.invite

  return {
    title: `${formData.eventTitle} - You're Invited!`,
    description: formData.eventDescription,
    openGraph: {
      title: `${formData.eventTitle} - You're Invited!`,
      description: formData.eventDescription,
      images: formData.uploadedImages?.hero ? [formData.uploadedImages.hero] : [],
    },
  }
}
