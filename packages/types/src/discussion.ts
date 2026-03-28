export interface DiscussionMessage {
  id: string
  caseId: string
  userId: string
  userName: string
  userRole: 'student' | 'educator' | 'admin'
  content: string
  parentId: string | null
  createdAt: string
  replies?: DiscussionMessage[]
}

export interface DiscussionThread {
  comments: DiscussionMessage[]
}

export interface CreateCommentInput {
  content: string
}

export interface CreateReplyInput {
  content: string
  parentId: string
}
