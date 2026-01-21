export interface ProjectPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  postId: string;
  parentId: string | null;
  parent?: Comment;
  replies?: Comment[];
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  title: string;
  slug: string;
  content: string;
  category: string;
  published?: boolean;
}

export interface UpdateProjectDto {
  title?: string;
  slug?: string;
  content?: string;
  category?: string;
  published?: boolean;
}

export interface CreateCommentDto {
  content: string;
  postId: string;
  parentId?: string;
}

export interface UpdateCommentDto {
  content?: string;
}
