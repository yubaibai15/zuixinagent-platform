-- 新能源汽车跨境出海方案智能体：CloudBase PostgreSQL 建表脚本
-- 在 CloudBase「SQL 数据库 → SQL 编辑器」粘贴并执行一次。

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'member',
  job_role text,
  avatar_key text,
  enabled boolean NOT NULL DEFAULT true,
  password_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_key text;

-- 将旧演示账号匿名化；不会影响管理员后来新建的其他成员。
UPDATE public.users
SET name = CASE email
  WHEN 'ops@nev.com' THEN 'OPS-A01'
  WHEN 'design@nev.com' THEN 'VIS-B01'
  WHEN 'data@nev.com' THEN 'DATA-C01'
  WHEN 'marketing@nev.com' THEN 'MKT-D01'
  WHEN 'admin@nev.com' THEN 'ADMIN-001'
  ELSE name
END,
job_role = CASE email
  WHEN 'ops@nev.com' THEN '电商运营师'
  WHEN 'design@nev.com' THEN '视觉设计师'
  WHEN 'data@nev.com' THEN '数据分析师'
  WHEN 'marketing@nev.com' THEN '数字营销师'
  WHEN 'admin@nev.com' THEN '系统管理员'
  ELSE job_role
END,
avatar_key = CASE email
  WHEN 'ops@nev.com' THEN 'ops'
  WHEN 'design@nev.com' THEN 'visual'
  WHEN 'data@nev.com' THEN 'data'
  WHEN 'marketing@nev.com' THEN 'marketing'
  WHEN 'admin@nev.com' THEN 'admin'
  ELSE avatar_key
END
WHERE email IN ('ops@nev.com','design@nev.com','data@nev.com','marketing@nev.com','admin@nev.com');

CREATE TABLE IF NOT EXISTS public.agents (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  role text,
  description text,
  system_prompt text,
  fixed_answers jsonb NOT NULL DEFAULT '[]'::jsonb,
  scope text NOT NULL DEFAULT 'team',
  status text NOT NULL DEFAULT 'draft',
  created_by text,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.files (
  id uuid PRIMARY KEY,
  owner_id uuid NOT NULL,
  owner_email text NOT NULL,
  name text NOT NULL,
  mime_type text,
  size integer NOT NULL DEFAULT 0,
  file_id text NOT NULL,
  extracted_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.files ADD COLUMN IF NOT EXISTS knowledge_base_id uuid;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS knowledge_base_ids jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.chats (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  agent_id uuid NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  source text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflows (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  nodes jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.knowledge_bases (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'ready',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.model_configs (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  provider text,
  model_id text,
  base_url text,
  enabled boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tool_configs (
  id uuid PRIMARY KEY,
  name text NOT NULL,
  description text,
  endpoint text,
  scope text NOT NULL DEFAULT 'team',
  enabled boolean NOT NULL DEFAULT true,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
  id uuid PRIMARY KEY,
  name text UNIQUE NOT NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_versions (
  id uuid PRIMARY KEY,
  agent_id uuid NOT NULL,
  version_no integer NOT NULL,
  snapshot jsonb NOT NULL,
  published_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY,
  actor_email text,
  action text NOT NULL,
  target_type text,
  target_id text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 集团项目协同：项目、任务、成果、审批与智能体访问记录。
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid PRIMARY KEY,
  code text NOT NULL,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  progress integer NOT NULL DEFAULT 0,
  owner_email text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY,
  project_id uuid,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'todo',
  priority text NOT NULL DEFAULT 'normal',
  assignee_email text,
  due_date text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.deliverables (
  id uuid PRIMARY KEY,
  project_id uuid,
  task_id uuid,
  title text NOT NULL,
  kind text NOT NULL DEFAULT 'link',
  url text,
  status text NOT NULL DEFAULT 'draft',
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.approvals (
  id uuid PRIMARY KEY,
  deliverable_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reviewer_email text,
  comment text,
  created_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.agent_launches (
  id uuid PRIMARY KEY,
  agent_key text NOT NULL,
  project_id uuid,
  actor_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_versions ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_agents_status_scope ON public.agents(status, scope);
CREATE INDEX IF NOT EXISTS idx_files_owner ON public.files(owner_id);
CREATE INDEX IF NOT EXISTS idx_chats_agent_created ON public.chats(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_versions_agent ON public.agent_versions(agent_id, version_no DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tasks_project_status ON public.tasks(project_id, status);
CREATE INDEX IF NOT EXISTS idx_deliverables_project ON public.deliverables(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_launches_created ON public.agent_launches(created_at DESC);

-- 让 PostgREST / CloudBase 接口立即重新读取新表结构。
NOTIFY pgrst, 'reload schema';
