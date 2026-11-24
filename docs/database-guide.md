# 数据库结构与接口说明

这份文档写给组内成员，说明数据库里有什么、代码里对应的名称是什么、怎么调用。
设计层面的说明（为什么这样建模）见 [`data-model.md`](data-model.md)，这里只讲结构和用法。

- 数据库：MongoDB
- 数据库名：`ai_career_agent`（由环境变量 `DB_NAME` 决定）
- 所有路径都相对于 `server/src/`

## 1. 总览

| 集合名 | 一条文档代表 | TypeScript 接口 | 类型文件 | 取集合的函数 | 状态 |
| --- | --- | --- | --- | --- | --- |
| `skills` | 一项技能 | `SkillDocument` | `types/skill.ts` | `skillsCollection()` | 已建 |
| `jobs` | 一个职业 | `JobDocument`（存储）<br>`Job`（接口返回） | `types/job.ts` | `jobsCollection()` | 已建 |
| `users` | 一个账号 | `UserDocument` | `types/user.ts` | `usersCollection()` | 已建 |
| `plans` | 一份学习计划 | `StudyPlanDocument` | `types/study-plan.ts` | `plansCollection()` | 已建 |
| `generation_tasks` | 一次计划生成请求 | 未定义 | 无 | 无 | 仅规划 |

“已建”指：类型、集合访问函数、样例数据和索引都在仓库里。
目前只有 `jobs` 有查询函数（`getJobs()`）；其他集合还没有查询函数，也没有 HTTP 接口。

### 关系

```text
users ──< plans >── jobs ──< 内嵌技能副本 >── skills
  │         │                                   ▲
  │         └── tasks[]（内嵌），每个任务 ───────┤
  └── skillIds[] ──────────────────────────────┘
                          skills.prerequisiteIds[] ──> skills
```

| 引用字段 | 指向 |
| --- | --- |
| `jobs.skills[].id` | `skills._id` |
| `users.skillIds[]` | `skills._id` |
| `skills.prerequisiteIds[]` | `skills._id` |
| `plans.userId` | `users._id` |
| `plans.jobId` | `jobs._id` |
| `plans.tasks[].skillId` | `skills._id` |

MongoDB 不会检查这些引用是否有效。写入引用的代码要自己确认目标存在。

## 2. 连接与配置

### 环境变量（`server/.env`）

| 变量 | 默认值 | 用途 |
| --- | --- | --- |
| `MONGODB_URI` | `mongodb://localhost:27017` | MongoDB 地址 |
| `DB_NAME` | `ai_career_agent` | 使用的数据库名 |

两个变量都不设时使用默认值，所以本地开发可以不填。

### `config.ts`

| 导出 | 类型 | 说明 |
| --- | --- | --- |
| `mongoUri` | `string` | 读取 `MONGODB_URI`，否则用默认值 |
| `dbName` | `string` | 读取 `DB_NAME`，否则用默认值 |

### `db/db.ts`

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `connectDb` | `(uri: string, name: string) => Promise<Db>` | 建立连接。进程里只调用一次；已连接时再调用会抛错。 |
| `getDb` | `() => Db` | 取当前数据库实例。未连接时抛错。 |
| `closeDb` | `() => Promise<void>` | 关闭连接。之后可以重新 `connectDb`。 |

服务器、seed 脚本和测试各自调用 `connectDb` 并传入自己的地址和库名，测试因此不会碰到开发数据库。

### `db/collections.ts`

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `skillsCollection` | `() => Collection<SkillDocument>` | `skills` 集合 |
| `usersCollection` | `() => Collection<UserDocument>` | `users` 集合 |
| `plansCollection` | `() => Collection<StudyPlanDocument>` | `plans` 集合 |
| `ensureIndexes` | `() => Promise<void>` | 创建下面第 3 节列出的索引。可重复调用，服务器启动时应调用一次。 |

### `db/jobs-repository.ts`

| 函数 | 签名 | 说明 |
| --- | --- | --- |
| `jobsCollection` | `() => Collection<JobDocument>` | `jobs` 集合 |
| `getJobs` | `() => Promise<Job[]>` | 返回全部职业，按 `title` 升序；把 `_id` 转成 `id`；没有数据时返回 `[]`。 |

## 3. 各集合的字段

### 3.1 `skills`

接口：`SkillDocument`，另有类型 `SkillDifficulty`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | `string` | 稳定的 slug，如 `"pytorch"`。其他集合都用它引用技能。 |
| `name` | `string` | 显示名，如 `"PyTorch"` |
| `category` | `string` | 分类，如 `"Deep Learning"` |
| `difficulty` | `SkillDifficulty` | `"beginner"`、`"intermediate"` 或 `"advanced"` |
| `estimatedHours` | `number` | 具备前置技能后达到可用水平的大致学时 |
| `prerequisiteIds` | `string[]` | 应先学的技能的 `_id`。不能形成循环。 |

索引：只有默认的 `_id`。

示例：

```json
{
  "_id": "pytorch",
  "name": "PyTorch",
  "category": "Deep Learning",
  "difficulty": "intermediate",
  "estimatedHours": 40,
  "prerequisiteIds": ["python", "deep-learning-fundamentals"]
}
```

### 3.2 `jobs`

接口：`JobDocument`（数据库里的样子）、`Job`（`getJobs()` 和 `GET /jobs` 返回的样子）、`JobSkill`（内嵌的技能）。
两者的唯一区别：数据库里主键叫 `_id`，返回给前端时叫 `id`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id`（返回时为 `id`） | `string` | 稳定的 slug，如 `"ai-engineer"` |
| `title` | `string` | 职业名称 |
| `industry` | `string` | 行业，如 `"AI"`、`"Data"` |
| `description` | `string` | 一句话简介 |
| `skills` | `JobSkill[]` | 该职业要求的技能 |

`JobSkill`：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 对应 `skills._id` |
| `name` | `string` | 技能显示名的副本 |

职业里内嵌的是技能的 `id` 和 `name` 副本。难度、学时、前置技能只存在 `skills` 集合里，需要时按 `id` 去查。

索引：只有默认的 `_id`。

`getJobs()` 返回的一条数据：

```json
{
  "id": "prompt-engineer",
  "title": "Prompt Engineer",
  "industry": "AI",
  "description": "Designs, tests and refines the instructions that steer language models.",
  "skills": [
    { "id": "llm-fundamentals", "name": "LLM Fundamentals" },
    { "id": "prompt-engineering", "name": "Prompt Engineering" },
    { "id": "llm-evaluation", "name": "LLM Evaluation" },
    { "id": "llm-apis", "name": "LLM APIs" },
    { "id": "technical-writing", "name": "Technical Writing" }
  ]
}
```

### 3.3 `users`

接口：`UserDocument`，另有类型 `UserRole`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | `ObjectId` | |
| `email` | `string` | 登录名，唯一 |
| `passwordHash` | `string` | bcrypt hash。不存明文密码；任何接口都不应返回这个字段。 |
| `displayName` | `string` | 显示名 |
| `role` | `UserRole` | `"user"` 或 `"admin"`。访客是未登录的人，没有文档。 |
| `currentRole` | `string` | 用户现在的职业，自由文本，如 `"Accountant"` |
| `skillIds` | `string[]` | 用户已掌握的技能，对应 `skills._id` |
| `createdAt` | `Date` | |

索引：`email` 唯一索引（索引名 `email_1`）。插入重复邮箱会被数据库拒绝。

注意 `role` 是账号权限，`currentRole` 是用户的职业，两者无关。

### 3.4 `plans`

接口：`StudyPlanDocument`、`LearningTask`，另有类型 `StudyPlanStatus`、`LearningTaskStatus`。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | `ObjectId` | |
| `userId` | `ObjectId` | 计划的主人，对应 `users._id`。只有主人可以读写。 |
| `jobId` | `string` | 目标职业，对应 `jobs._id` |
| `title` | `string` | 计划标题 |
| `status` | `StudyPlanStatus` | `"active"`、`"completed"` 或 `"archived"` |
| `tasks` | `LearningTask[]` | 学习任务，内嵌在计划里 |
| `createdAt` | `Date` | |
| `updatedAt` | `Date` | 修改计划或任务时要更新 |

`LearningTask`（学习任务）：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 在所属计划内唯一，如 `"task-1"` |
| `title` | `string` | 任务标题 |
| `skillId` | `string` | 这个任务学的技能，对应 `skills._id` |
| `week` | `number` | 安排在计划的第几周，从 1 开始 |
| `status` | `LearningTaskStatus` | `"not_started"`、`"in_progress"` 或 `"completed"` |

索引：`userId`（索引名 `userId_1`），用于列出某个用户的全部计划。

一个用户可以有多份计划。目标职业记在计划上，不记在用户上。

### 3.5 `generation_tasks`（仅规划，代码里还没有）

一次后台生成计划的请求。字段是设计稿，实现时可能调整。

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `_id` | `ObjectId` | |
| `userId` | `ObjectId` | 发起人，对应 `users._id` |
| `jobId` | `string` | 目标职业，对应 `jobs._id` |
| `status` | `string` | `"pending"`、`"processing"`、`"succeeded"` 或 `"failed"` |
| `planId` | `ObjectId \| null` | 成功后生成的计划，对应 `plans._id` |
| `error` | `string \| null` | 失败时给用户看的说明 |
| `createdAt`、`updatedAt` | `Date` | |

两个容易混的词：**生成任务**（generation task）是一次后台生成请求；**学习任务**（learning task）是计划里的一个学习步骤。

## 4. 样例数据与 seed

在 `server/` 目录下运行：

```bash
npm run seed
```

脚本是 `scripts/seed.ts`。它会读取 `server/.env`（如果存在）、连接数据库、创建索引、写入样例数据，然后退出。

| 集合 | 数量 | 数据文件 | 导出名 |
| --- | --- | --- | --- |
| `skills` | 58 | `data/skills-seed.ts` | `skillsSeed`，以及类型 `SeedSkillId` |
| `jobs` | 25 | `data/jobs-seed.ts` | `jobsSeed` |
| `users` | 3 | `data/users-seed.ts` | `usersSeed`、`seedUserIds`、`SEED_PASSWORD` |
| `plans` | 2 | `data/plans-seed.ts` | `plansSeed` |

- **可以重复运行。** 每条数据按固定的 `_id` 整体替换或插入，不会产生重复；对这些样例文档所做的修改也会被覆盖，样例用户密码会重新散列写入。
- **不会删除数据。** 数据库里有、seed 文件里没有的文档会原样保留。
- **样例用户是虚构的。** 1 个管理员和 2 个普通用户，共用一个仅供本地开发的密码，定义在 `data/users-seed.ts` 里。部署时不能直接使用。
- **数据来源。** 一部分职业和技能来自原型项目的数据集，其余是为本项目编写的示例数据，各 seed 文件开头的注释有说明。

`data/seed-data.unit.test.ts` 会检查 seed 文件之间的 id 引用都有效、前置技能不成环。改动 seed 数据后运行 `npm test` 即可发现写错的 id。

## 5. 怎么使用

相对导入要写 `.js` 后缀；源码仍为 `.ts`，例如 `../config.js` 对应 `server/src/config.ts`，无需另外创建 `config.js`。启动示例位于 `server/src/index.ts`，使用 `./`；controller 和测试示例位于其下一级目录，使用 `../`。

### 服务器启动时（A）

```typescript
import { mongoUri, dbName } from './config.js';
import { connectDb } from './db/db.js';
import { ensureIndexes } from './db/collections.js';

await connectDb(mongoUri, dbName);
await ensureIndexes();
```

### 在 controller 里读职业（A）

```typescript
import { getJobs } from '../db/jobs-repository.js';

const jobs = await getJobs(); // Job[]
```

### 在测试里（C）

用内存数据库，不连接开发数据库。完整例子见 `db/jobs-repository.e2e.test.ts`。

```typescript
import { MongoMemoryServer } from 'mongodb-memory-server';
import { closeDb, connectDb } from '../db/db.js';
import { jobsCollection } from '../db/jobs-repository.js';

const mongod = await MongoMemoryServer.create();
await connectDb(mongod.getUri(), 'test');

await jobsCollection().insertOne({
  _id: 'ai-engineer',
  title: 'AI Engineer',
  industry: 'AI',
  description: 'Builds ML applications.',
  skills: [{ id: 'pytorch', name: 'PyTorch' }]
});

// 测试结束后
await closeDb();
await mongod.stop();
```

## 6. 对应的 HTTP 接口

HTTP 接口由 A 负责，以 [`endpoints.md`](endpoints.md) 为准。下表只说明每个集合会被哪些接口用到。
除 `GET /jobs` 外，路径都来自操作指南里的设计示例，尚未最终确定，也都没有实现。

| 集合 | 接口 | 状态 |
| --- | --- | --- |
| `jobs` | `GET /jobs` | 已实现：路由、controller、`getJobs()` 及端到端测试均在仓库中 |
| `jobs`、`skills` | 管理员对职业和技能的增删改 | 规划中，路径待定 |
| `users` | 注册、登录、读取和修改个人资料 | 规划中，路径待定 |
| `plans` | `GET /plans`、`GET /plans/:planId` | 规划中 |
| `plans` | `PATCH /plans/:planId/tasks/:taskId` | 规划中 |
| `generation_tasks` | `POST /generation-tasks`、`GET /generation-tasks/:taskId` | 规划中 |

## 7. 改动约定

`types/` 下的接口是三人共用的约定。要改字段名、类型或 `getJobs()` 的返回结构，先通知依赖它的人，并同步更新这份文档和 `data-model.md`。
