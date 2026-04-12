export type TIL = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  slug: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateTILInput = {
  title: string;
  content: string;
  tags: string;
};
