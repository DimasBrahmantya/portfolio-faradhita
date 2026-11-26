export type SheetName =
  | 'Facts'
  | 'Projects'
  | 'Certificates'
  | 'Experience'
  | 'Publications'
  | 'Skills';

export type AdminSectionSlug =
  | 'profil'
  | 'tentang'
  | 'project'
  | 'sertifikat'
  | 'pengalaman'
  | 'publikasi'
  | 'keahlian'
  | 'kontak';

export interface Profile {
  full_name_1: string;
  full_name_2: string;
  logo_text: string;
  role: string;
  hero_cta_primary: string;
  hero_cta_secondary: string;
  hero_photo_url: string;
  about_photo_url: string;
  about_text: string;
  contact_intro: string;
  whatsapp_url: string;
  linkedin_url: string;
  email: string;
  location: string;
  meta_title: string;
  meta_description: string;
  og_image_url: string;
}

export interface ListItemBase {
  id: string;
  order: number;
  visible: boolean;
}

export interface Fact extends ListItemBase {
  value: string;
  label: string;
}

export interface ProjectPoint {
  label: string;
  text: string;
}

export interface ProjectImage {
  url: string;
  caption: string;
  wide: boolean;
}

export interface Project extends ListItemBase {
  title: string;
  tags: string[];
  description: string;
  points: ProjectPoint[];
  images: ProjectImage[];
  slug: string;
}

export interface Certificate extends ListItemBase {
  title: string;
  image_url: string;
  issuer: string;
  issued_at: string;
  credential_url: string;
}

export type ExperienceType = 'work' | 'education' | 'training';

export interface Experience extends ListItemBase {
  type: ExperienceType;
  period: string;
  title: string;
  subtitle: string;
  points: string[];
  images: ProjectImage[];
}

export interface Publication extends ListItemBase {
  title: string;
  venue: string;
  date: string;
  url: string;
}

export interface Skill extends ListItemBase {
  name: string;
  icon_url: string;
}

export interface ContentBundle {
  profile: Profile;
  facts: Fact[];
  projects: Project[];
  certificates: Certificate[];
  experience: Experience[];
  publications: Publication[];
  skills: Skill[];
}

export interface ContentResult {
  ok: boolean;
  data: ContentBundle | null;
  fromCache?: boolean;
  error?: string;
}
