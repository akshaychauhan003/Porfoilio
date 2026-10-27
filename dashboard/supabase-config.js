/**
 * ════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT & DATA PROVIDER FOR PORTFOLIO & DASHBOARD
 * ════════════════════════════════════════════════════════════════
 * Manages all cloud database interactions (Messages, Reviews,
 * Experiences, and Projects) with instant local fallback.
 */

const SUPABASE_FALLBACK_URL = 'https://vppkucipdfbshqxjwlcx.supabase.co';
const SUPABASE_FALLBACK_ANON_KEY = 'sb_publishable_D3V48ToGaEfKcz1j5TuosA_9ilWhesr';

const SUPABASE_CONFIG = {
    // Loaded dynamically from window.SUPABASE_KEYS, falling back to authoritative cloud keys:
    url: (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.url) || SUPABASE_FALLBACK_URL,
    anonKey: (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.anonKey) || SUPABASE_FALLBACK_ANON_KEY,
    
    // EmailJS credentials for dual inbox delivery (optional):
    emailJsServiceId: (typeof window !== 'undefined' && window.EMAILJS_SERVICE_ID) || localStorage.getItem('portfolio_emailjs_service_id') || '',
    emailJsTemplateId: (typeof window !== 'undefined' && window.EMAILJS_TEMPLATE_ID) || localStorage.getItem('portfolio_emailjs_template_id') || '',
    emailJsPublicKey: (typeof window !== 'undefined' && window.EMAILJS_PUBLIC_KEY) || localStorage.getItem('portfolio_emailjs_public_key') || '',
};

// Authoritative Default Fallback Data (ensures 100% functionality offline, on CDN delay, or before cloud credentials)
const DEFAULT_FALLBACK_DATA = {
    projects: [
        {
            id: 'titan',
            slug: 'titan',
            title: 'TITAN – Smart Inventory & Sales System',
            category: 'Desktop Systems · Security',
            description: 'Offline-first smart inventory and POS system built with Electron, React, and TypeScript with embedded SQLite. Features local face-recognition authentication, encrypted credential storage, and automated PDF/CSV business reporting.',
            tech_stack: ['Electron', 'React', 'TypeScript', 'SQLite', 'Face Auth', 'Local Encryption'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#3d8bff',
            order_index: 2,
            is_active: true
        },
        {
            id: 'degs-platform',
            slug: 'degs-platform',
            title: 'DeGS Digitization Platform',
            category: 'Enterprise Backend · Govt of Delhi',
            description: 'Scalable enterprise digitization platform engineered for Delhi e-Governance Society (DeGS) to digitize ground-level employee records, field inspections, and administrative workflows with structured validation.',
            tech_stack: ['Java 17', 'Spring Boot', 'Spring Data JPA', 'MySQL', 'REST APIs', 'RBAC'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#f59e0b',
            order_index: 3,
            is_active: true
        },
        {
            id: 'caseflow',
            slug: 'caseflow',
            title: 'CaseFlow Legal Manager',
            category: 'Legal Tech · Workflow AI',
            description: 'AI-assisted legal workflow automation platform orchestrating case intake summarization, appointment scheduling, and structured client-lawyer communications with NLP pipelines.',
            tech_stack: ['Python', 'Flask', 'NLP Pipelines', 'SQLite', 'Automation'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#06b6d4',
            order_index: 4,
            is_active: true
        },
        {
            id: 'boxoffice-oracle',
            slug: 'boxoffice-oracle',
            title: 'BoxOffice Oracle',
            category: 'Predictive ML · Data Science',
            description: 'Predictive machine learning pipeline analyzing historical cinematic, budget, and distribution features with regression and classification models to forecast box-office commercial viability.',
            tech_stack: ['Python', 'Scikit-learn', 'Pandas', 'NumPy', 'Matplotlib'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#8b5cf6',
            order_index: 5,
            is_active: true
        },
        {
            id: 'akrti-dashboard',
            slug: 'akrti-dashboard',
            title: 'AKRTI BI Dashboard',
            category: 'Business Intelligence · Analytics',
            description: 'Comprehensive enterprise KPI intelligence dashboard providing executive visibility into revenue velocity, customer retention patterns, and multi-dimensional operational metrics.',
            tech_stack: ['Power BI', 'Tableau', 'DAX', 'SQL', 'KPI Analytics'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#f59e0b',
            order_index: 6,
            is_active: true
        },
        {
            id: 'fr-bot',
            slug: 'fr-bot',
            title: 'FR Bot',
            category: 'AI & Automation',
            description: 'Rule-based assistant designed for fast intent resolution with keyword routing, structured fallback responses, and repeatable interaction flows.',
            tech_stack: ['Python', 'NLP', 'Regex', 'FastAPI'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#10b981',
            order_index: 7,
            is_active: true
        },
        {
            id: 'password-hunter',
            slug: 'password-hunter',
            title: 'Password Hunter',
            category: 'Cyber Security · Simulator',
            description: 'Cyberpunk brute-force simulator with terminal storytelling, password analysis, installable app support, and real-time security theatre.',
            tech_stack: ['Next.js', 'Rust', 'CloudFront', 'DynamoDB', 'Lambda@Edge'],
            live_url: '#',
            github_url: '',
            video_url: '',
            preview_type: 'surface',
            card_color: '#ef4444',
            order_index: 8,
            is_active: true
        }
    ],
    experiences: [
        {
            id: '109f1ab7-67a5-4ad8-af12-0058cfe551aa',
            role: 'Data Analyst Intern',
            company: 'CodSoft',
            location: 'Remote [office]',
            duration: 'August 2025 — September 2025',
            description: 'Designed modular data analysis and visualization pipelines with Python (Pandas, NumPy, Matplotlib) and Excel, streamlining structured exploratory data analysis (EDA) and automated summary generation.',
            category: 'office',
            type: 'office',
            order_index: 1
        },
        {
            id: '279dea07-d4ac-4c57-b4e1-b4bb692a766a',
            role: 'Data Analyst Intern',
            company: 'Sunbuzz Media',
            location: 'Delhi, India [office]',
            duration: 'January 2025 — February 2025',
            description: 'Built end-to-end Python and SQL data processing pipelines, created executive KPI dashboards in Power BI and Tableau, and uncovered high-impact engagement trends across digital media campaigns.',
            category: 'office',
            type: 'office',
            order_index: 2
        },
        {
            id: '8a3da64e-84f8-49da-a467-1a4931d197bc',
            role: 'Freelance Web Developer',
            company: 'Travoqix',
            location: 'Remote [freelance]',
            duration: 'March 2025',
            description: 'Engineered a high-performance frontend foundation featuring responsive booking workflows, modern UI architecture, and dynamic video showcase deployed live at travoqix.in.',
            category: 'freelance',
            type: 'freelance',
            video_url: 'assets/videos/Travoqix.mp4',
            live_url: 'https://travoqix.in/',
            order_index: 3
        },
        {
            id: '7ecd9a93-0c8a-43f4-bc46-1322af66ccbe',
            role: 'Freelance Software Developer',
            company: 'Krisha Events',
            location: 'Remote [freelance]',
            duration: 'September 2025 — Present',
            description: 'Architecting a unified cross-platform event & finance management application across desktop and mobile. Implemented centralized budget tracking, vendor contract management, and automated client billing workflows.',
            category: 'freelance',
            type: 'freelance',
            order_index: 4
        },
        {
            id: 'c594690d-05af-4d13-b68b-716dc75277a6',
            role: 'AI/ML & API Developer Intern',
            company: 'Delhi e-Governance Society (DeGS)',
            location: 'Delhi, India [office]',
            duration: 'August 2025 — Present',
            description: 'Engineered enterprise backend APIs with Java 17, Spring Boot, and Spring Data JPA to digitize ground-level employee records and field inspection reports. Integrated automated validation pipelines, MySQL persistence, and machine learning models to modernize government workflows.',
            category: 'office',
            type: 'office',
            order_index: 5
        }
    ],
    reviews: [
        {
            id: 'rev-1',
            client_name: 'Mr. Satyajit Nanda',
            client_title: 'CEO',
            client_company: 'Travoqix',
            company_website: 'https://travoqix.in/',
            rating: 5,
            review_text: 'I am really impressed with the work done on Travoqix. The website turned out far better and more beautiful than we expected. The attention to detail, animations, and overall design quality were excellent. The project was completed in just 2 weeks, while the expected timeline was 30 days. Everything was handled professionally and smoothly. Highly recommended for quality web development work.',
            status: 'approved',
            is_featured: true,
            created_at: '2025-03-15T10:00:00Z'
        },
        {
            id: 'rev-2',
            client_name: 'Mr. Aniket Gupta',
            client_title: 'COO',
            client_company: 'Sunbuzz Media',
            rating: 5,
            review_text: 'Outstanding analytical and problem-solving capability. Delivered clean dashboards and automated repetitive data pipeline tasks with precision.',
            status: 'approved',
            is_featured: true,
            created_at: '2025-02-28T14:30:00Z'
        }
    ],
    messages: []
};

// Safe cache sanitization to prevent stale deleted keys from hiding active experiences
(function sanitizeStorage() {
    if (typeof localStorage === 'undefined') return;
    try {
        const deletedExp = localStorage.getItem('portfolio_deleted_experiences');
        if (deletedExp) {
            const list = JSON.parse(deletedExp);
            if (Array.isArray(list)) {
                const activeUuids = DEFAULT_FALLBACK_DATA.experiences.map(e => String(e.id).toLowerCase());
                const cleaned = list.filter(id => !activeUuids.includes(String(id).toLowerCase()));
                localStorage.setItem('portfolio_deleted_experiences', JSON.stringify(cleaned));
            }
        }
    } catch (_) {}
})();

// Dynamic Configuration Resolver
function getEffectiveSupabaseConfig() {
    const url = (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.url) || SUPABASE_CONFIG.url || SUPABASE_FALLBACK_URL;
    const anonKey = (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.anonKey) || SUPABASE_CONFIG.anonKey || SUPABASE_FALLBACK_ANON_KEY;
    if (url) SUPABASE_CONFIG.url = url;
    if (anonKey) SUPABASE_CONFIG.anonKey = anonKey;
    if (typeof window !== 'undefined') window.SUPABASE_CONFIG = SUPABASE_CONFIG;
    return { url, anonKey };
}

// Initialize Supabase Client if credentials exist
// Initialize Supabase Client & High-Speed Multi-Tab Sync
let supabaseClient = null;
let isRealtimeSubscribed = false;
let portfolioSyncChannel = null;

function getPortfolioSyncChannel() {
    if (typeof BroadcastChannel === 'undefined') return null;
    if (!portfolioSyncChannel) {
        try {
            portfolioSyncChannel = new BroadcastChannel('portfolio_sync');
        } catch (_) {}
    }
    return portfolioSyncChannel;
}

function postPortfolioSync(message) {
    try {
        const ch = getPortfolioSyncChannel();
        if (ch) ch.postMessage(message);
    } catch (_) {}
}

function initRealtimeSubscription(client) {
    if (!client || isRealtimeSubscribed || typeof window === 'undefined') return;
    try {
        isRealtimeSubscribed = true;
        client
            .channel('realtime:all_portfolio_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                console.log('[Supabase Realtime] Project table mutation detected:', payload.eventType);
                const project = payload.new || payload.old;
                try {
                    window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: project }));
                    postPortfolioSync({
                        type: payload.eventType === 'DELETE' ? 'project-deleted' : 'project-saved',
                        project,
                        id: project?.id,
                        slug: project?.slug
                    });
                } catch (_) {}
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, (payload) => {
                console.log('[Supabase Realtime] Experience table mutation detected:', payload.eventType);
                const exp = payload.new || payload.old;
                try {
                    window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: exp }));
                    postPortfolioSync({
                        type: payload.eventType === 'DELETE' ? 'experience-deleted' : 'experience-saved',
                        experience: exp,
                        id: exp?.id
                    });
                } catch (_) {}
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_reviews' }, (payload) => {
                console.log('[Supabase Realtime] Client reviews table mutation detected:', payload.eventType);
                const review = payload.new || payload.old;
                try {
                    window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: review }));
                    postPortfolioSync({
                        type: payload.eventType === 'DELETE' ? 'review-deleted' : 'review-saved',
                        review,
                        id: review?.id
                    });
                } catch (_) {}
            })
            .subscribe();
    } catch (e) {
        console.warn('[Supabase Realtime] Subscription notice:', e);
    }
}

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const { url, anonKey } = getEffectiveSupabaseConfig();
    if (url && anonKey && typeof window !== 'undefined' && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, anonKey, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
            initRealtimeSubscription(supabaseClient);
        } catch (e) {
            console.warn('[Supabase] Initialization failed, falling back to local store:', e);
        }
    }
    return supabaseClient;
}

// Offline Pending Queue for Messages (auto-flushes when cloud RLS/connectivity is online)
function getPendingMessages() {
    try {
        const raw = localStorage.getItem('portfolio_pending_messages');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function queuePendingMessage(payload) {
    try {
        const list = getPendingMessages();
        const exists = list.some(m => m.email === payload.email && m.message === payload.message);
        if (!exists) {
            list.push({ ...payload, queued_at: new Date().toISOString() });
            localStorage.setItem('portfolio_pending_messages', JSON.stringify(list));
        }
    } catch (_) {}
}

async function flushPendingMessages(client) {
    if (!client) return;
    const pending = getPendingMessages();
    if (!Array.isArray(pending) || pending.length === 0) return;
    const remaining = [];
    for (const msg of pending) {
        try {
            const { queued_at, ...cleanPayload } = msg;
            const { error } = await client.from('contact_messages').insert([cleanPayload]);
            if (error) {
                remaining.push(msg);
            }
        } catch {
            remaining.push(msg);
        }
    }
    try {
        localStorage.setItem('portfolio_pending_messages', JSON.stringify(remaining));
    } catch (_) {}
}

// Deletion Tracking Helpers (prevents deleted projects & experiences from resurrecting)
function getDeletedIds(type) {
    try {
        const raw = localStorage.getItem(`portfolio_deleted_${type}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function markDeleted(type, idOrSlug) {
    if (!idOrSlug) return;
    try {
        const deleted = getDeletedIds(type);
        const str = String(idOrSlug).toLowerCase();
        if (!deleted.map(d => String(d).toLowerCase()).includes(str)) {
            deleted.push(idOrSlug);
            localStorage.setItem(`portfolio_deleted_${type}`, JSON.stringify(deleted));
        }
    } catch {}
}

function unmarkDeleted(type, idOrSlug) {
    if (!idOrSlug) return;
    try {
        const deleted = getDeletedIds(type);
        const str = String(idOrSlug).toLowerCase();
        const filtered = deleted.filter(d => String(d).toLowerCase() !== str);
        localStorage.setItem(`portfolio_deleted_${type}`, JSON.stringify(filtered));
    } catch {}
}

// Local Storage Helper
function getLocalCollection(key, defaultData) {
    try {
        const stored = localStorage.getItem(`portfolio_${key}`);
        if (!stored) {
            localStorage.setItem(`portfolio_${key}`, JSON.stringify(defaultData));
            return defaultData;
        }
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
            return parsed;
        }
        return defaultData;
    } catch {
        return defaultData;
    }
}

function setLocalCollection(key, data) {
    try {
        localStorage.setItem(`portfolio_${key}`, JSON.stringify(data));
    } catch (e) {
        console.error('LocalStorage write error:', e);
    }
}

// ─────────────────────────────────────────────────────────────
// DATA ACCESS API (Used by Portfolio and Dashboard)
// ─────────────────────────────────────────────────────────────

const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || ''));

// Strict 2.5s cloud timeout helper: NEVER blocks UI or causes lag
const CLOUD_TIMEOUT_MS = 2500;
function withCloudTimeout(promise, ms = CLOUD_TIMEOUT_MS) {
    if (!promise || typeof promise.then !== 'function') return Promise.resolve(promise);
    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Cloud request timed out')), ms);
    });
    return Promise.race([
        promise.finally(() => { if (timer) clearTimeout(timer); }),
        timeoutPromise
    ]);
}

const PortfolioData = {
    // ═════════════════════════════════════════════════════════════
    // SYNCHRONOUS INSTANT LOCAL GETTERS (0ms Latency)
    // ═════════════════════════════════════════════════════════════
    getLocalProjects() {
        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
        const isExcluded = (p) => {
            if (!p) return false;
            const s = String(p.slug || p.id || '').toLowerCase();
            const t = String(p.title || '').toLowerCase();
            return s.includes('travoqix') || t.includes('travoqix');
        };
        const localProjects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const resolved = (localProjects && localProjects.length > 0) ? localProjects : DEFAULT_FALLBACK_DATA.projects;
        return (resolved || [])
            .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()) && !isExcluded(p) && p.is_active !== false)
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
    },

    getLocalExperiences() {
        const deleted = getDeletedIds('experiences').map(d => String(d).toLowerCase());
        const local = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
        const resolved = (local && local.length > 0) ? local : DEFAULT_FALLBACK_DATA.experiences;
        return (resolved || [])
            .filter(e => !deleted.includes(String(e.id).toLowerCase()))
            .map(e => {
                const parsed = this._parseExperienceTrackAndLocation(e.location, e.role, e.company);
                return {
                    ...e,
                    location: parsed.location,
                    category: e.category || parsed.category,
                    type: e.type || parsed.category
                };
            })
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
    },

    getLocalReviews(approvedOnly = true) {
        const deleted = getDeletedIds('reviews').map(d => String(d).toLowerCase());
        const local = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        const resolved = (local && local.length > 0) ? local : DEFAULT_FALLBACK_DATA.reviews;
        return (resolved || [])
            .filter(r => (!approvedOnly || r.status === 'approved') && !deleted.includes(String(r.id).toLowerCase()))
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },

    getLocalMessages() {
        const deleted = getDeletedIds('messages').map(d => String(d).toLowerCase());
        const local = getLocalCollection('messages', []);
        return (local || [])
            .filter(m => !deleted.includes(String(m.id).toLowerCase()))
            .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    },

    // ═════════════════════════════════════════════════════════════
    // 1. PROJECTS (Instant Local Return + Background Cloud Sync)
    // ═════════════════════════════════════════════════════════════
    async getProjects() {
        const localFallback = this.getLocalProjects();

        // Background non-blocking cloud check
        const client = getSupabaseClient();
        if (client) {
            (async () => {
                try {
                    const { data, error } = await withCloudTimeout(
                        client.from('projects').select('*').order('order_index', { ascending: true }),
                        2500
                    );
                    if (!error && Array.isArray(data) && data.length > 0) {
                        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
                        const isExcluded = (p) => {
                            if (!p) return false;
                            const s = String(p.slug || p.id || '').toLowerCase();
                            const t = String(p.title || '').toLowerCase();
                            return s.includes('travoqix') || t.includes('travoqix');
                        };
                        const activeProjects = data
                            .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()) && !isExcluded(p) && p.is_active !== false)
                            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));

                        if (activeProjects.length > 0) {
                            const cur = getLocalCollection('projects', []);
                            // Merge: retain local edits that have not synced yet
                            const merged = activeProjects.map(cp => {
                                const lp = cur.find(l => l.id === cp.id || l.slug === cp.slug);
                                if (lp && lp._modified_at && (!cp.created_at || lp._modified_at > new Date(cp.created_at).getTime())) {
                                    return { ...cp, ...lp };
                                }
                                return cp;
                            });
                            cur.forEach(lp => {
                                if (lp._modified_at && !merged.some(m => m.id === lp.id || m.slug === lp.slug)) {
                                    merged.push(lp);
                                }
                            });
                            merged.sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
                            setLocalCollection('projects', merged);
                        }
                    }
                } catch (_) {}
            })();
        }

        return localFallback;
    },

    async getAllProjectsForAdmin() {
        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
        const localProjects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const resolved = (localProjects && localProjects.length > 0) ? localProjects : DEFAULT_FALLBACK_DATA.projects;
        const fallback = (resolved || [])
            .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()))
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));

        const client = getSupabaseClient();
        if (client) {
            (async () => {
                try {
                    const { data, error } = await withCloudTimeout(
                        client.from('projects').select('*').order('order_index', { ascending: true }),
                        2500
                    );
                    if (!error && Array.isArray(data) && data.length > 0) {
                        const activeProjects = data
                            .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()))
                            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
                        if (activeProjects.length > 0) {
                            setLocalCollection('projects', activeProjects);
                        }
                    }
                } catch (_) {}
            })();
        }

        return fallback.length > 0 ? fallback : DEFAULT_FALLBACK_DATA.projects;
    },

    async saveProject(project) {
        if (!project.slug) {
            project.slug = (project.id && !isValidUUID(project.id))
                ? String(project.id).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                : (project.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (project.slug) unmarkDeleted('projects', project.slug);
        if (project.id) unmarkDeleted('projects', project.id);

        project._modified_at = Date.now();

        // 1. INSTANT LOCAL UPDATE (0ms)
        const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const normTitle = (project.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        const idx = projects.findIndex(p => 
            p.slug === project.slug || 
            p.id === project.id ||
            ((p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '') === normTitle && normTitle.length > 0)
        );
        if (idx >= 0) projects[idx] = { ...projects[idx], ...project };
        else projects.push(project);
        setLocalCollection('projects', projects);

        // 2. INSTANT MULTI-TAB & REAL-TIME BROADCAST (< 2ms)
        try {
            window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: project }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_projects',
                newValue: JSON.stringify(projects)
            }));
            postPortfolioSync({ type: 'project-saved', project, projects });
        } catch (_) {}

        // 3. NON-BLOCKING BACKGROUND CLOUD SYNC
        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                const dbPayload = { ...project };
                delete dbPayload._modified_at;
                if (!isValidUUID(dbPayload.id)) {
                    delete dbPayload.id;
                }
                const { id: _ignoredId, ...updateFields } = dbPayload;

                let savedRow = null;
                if (isValidUUID(project.id)) {
                    const upRes = await withCloudTimeout(client.from('projects').update(updateFields).eq('id', project.id).select(), 2500);
                    if (!upRes.error && upRes.data && upRes.data.length > 0) {
                        savedRow = upRes.data[0];
                    }
                }
                if (!savedRow && dbPayload.slug) {
                    const upRes = await withCloudTimeout(client.from('projects').update(updateFields).eq('slug', dbPayload.slug).select(), 2500);
                    if (!upRes.error && upRes.data && upRes.data.length > 0) {
                        savedRow = upRes.data[0];
                    }
                }
                if (!savedRow) {
                    const upRes = await withCloudTimeout(client.from('projects').upsert(dbPayload, { onConflict: 'slug' }).select(), 2500);
                    if (!upRes.error && upRes.data && upRes.data.length > 0) {
                        savedRow = upRes.data[0];
                    }
                }
                if (savedRow) {
                    const cur = getLocalCollection('projects', []);
                    const i = cur.findIndex(p => p.slug === project.slug || p.id === project.id);
                    if (i >= 0) {
                        cur[i] = { ...cur[i], ...savedRow };
                        setLocalCollection('projects', cur);
                    }
                }
            } catch (err) {
                console.warn('[Supabase Cloud Sync] Background project save notice:', err.message || err);
            }
        })();

        return project;
    },

    async reorderProject(id, direction) {
        const projects = this.getLocalProjects();
        const index = projects.findIndex(p => p.id === id || p.slug === id);
        if (index === -1) return projects;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= projects.length) return projects;

        // Swap adjacent projects
        const temp = projects[index];
        projects[index] = projects[targetIndex];
        projects[targetIndex] = temp;

        // Re-index sequentially from 1
        projects.forEach((p, idx) => {
            p.order_index = idx + 1;
            p._modified_at = Date.now();
        });

        setLocalCollection('projects', projects);

        // Instant broadcast
        try {
            window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: projects[targetIndex] }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_projects',
                newValue: JSON.stringify(projects)
            }));
            postPortfolioSync({ type: 'project-reordered', project: projects[targetIndex], projects });
        } catch (_) {}

        // Non-blocking cloud update
        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                const updateItem = async (p) => {
                    const matchQuery = isValidUUID(p.id) ? { id: p.id } : { slug: p.slug };
                    await withCloudTimeout(client.from('projects').update({ order_index: p.order_index }).match(matchQuery), 2500);
                };
                await Promise.all([
                    updateItem(projects[index]),
                    updateItem(projects[targetIndex])
                ]);
            } catch (_) {}
        })();

        return projects;
    },

    async deleteProject(id) {
        markDeleted('projects', id);
        const allProj = getLocalCollection('projects', []) || [];
        const proj = allProj.find(p => p.id === id || p.slug === id);
        if (proj) {
            if (proj.slug) markDeleted('projects', proj.slug);
            if (proj.id) markDeleted('projects', proj.id);
        }

        const projects = allProj.filter(p => p.id !== id && p.slug !== id && (proj ? p.slug !== proj.slug : true));
        setLocalCollection('projects', projects);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_projects',
                newValue: JSON.stringify(projects)
            }));
            postPortfolioSync({ type: 'project-deleted', id, slug: proj?.slug, projects });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('projects').delete().eq('id', id), 2500);
                }
                if (proj && proj.slug) {
                    await withCloudTimeout(client.from('projects').delete().eq('slug', proj.slug), 2500);
                } else if (!isValidUUID(id)) {
                    await withCloudTimeout(client.from('projects').delete().eq('slug', id), 2500);
                }
            } catch (_) {}
        })();

        return true;
    },

    // ═════════════════════════════════════════════════════════════
    // 2. EXPERIENCES
    // ═════════════════════════════════════════════════════════════
    _parseExperienceTrackAndLocation(rawLocation, role, company) {
        const raw = String(rawLocation || '').trim();
        let category = 'office';
        let cleanLocation = raw;

        if (/\[freelance\]/i.test(raw)) {
            category = 'freelance';
            cleanLocation = raw.replace(/\s*\[freelance\]\s*/gi, '').trim();
        } else if (/\[office\]/i.test(raw)) {
            category = 'office';
            cleanLocation = raw.replace(/\s*\[office\]\s*/gi, '').trim();
        } else {
            const c = (company || '').toLowerCase();
            const r = (role || '').toLowerCase();
            if (c.includes('travoqix') || c.includes('krisha events') || r.includes('freelance')) {
                category = 'freelance';
            } else {
                category = 'office';
            }
        }
        return { category, location: cleanLocation };
    },

    async getExperiences() {
        const local = this.getLocalExperiences();

        const client = getSupabaseClient();
        if (client) {
            (async () => {
                try {
                    const { data, error } = await withCloudTimeout(
                        client.from('experiences').select('*').order('order_index', { ascending: true }),
                        2500
                    );
                    if (!error && Array.isArray(data) && data.length > 0) {
                        const deleted = getDeletedIds('experiences').map(d => String(d).toLowerCase());
                        const filtered = data.filter(e => !deleted.includes(String(e.id).toLowerCase()));
                        if (filtered.length > 0) {
                            const enriched = filtered.map(cloudExp => {
                                const parsed = this._parseExperienceTrackAndLocation(cloudExp.location, cloudExp.role, cloudExp.company);
                                return {
                                    ...cloudExp,
                                    location: parsed.location,
                                    category: parsed.category,
                                    type: parsed.category
                                };
                            });
                            setLocalCollection('experiences', enriched);
                        }
                    }
                } catch (_) {}
            })();
        }

        return local;
    },

    async saveExperience(exp) {
        if (exp.id) unmarkDeleted('experiences', exp.id);
        exp._modified_at = Date.now();

        const isFreelance = exp.category === 'freelance' || exp.type === 'freelance';
        const targetCategory = isFreelance ? 'freelance' : 'office';
        const baseLocation = String(exp.location || '').replace(/\s*\[(freelance|office)\]\s*/gi, '').trim();
        const taggedLocation = baseLocation ? `${baseLocation} [${targetCategory}]` : `[${targetCategory}]`;

        const effectiveExp = {
            ...exp,
            id: exp.id || ('exp-' + Date.now()),
            location: baseLocation,
            category: targetCategory,
            type: targetCategory
        };

        // 1. Instant local update
        const exps = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
        const idx = exps.findIndex(e => e.id === exp.id || (e.role === exp.role && e.company === exp.company));
        if (idx >= 0) exps[idx] = { ...exps[idx], ...effectiveExp };
        else exps.push(effectiveExp);
        setLocalCollection('experiences', exps);

        // 2. Instant multi-tab broadcast
        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: effectiveExp }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_experiences',
                newValue: JSON.stringify(exps)
            }));
            postPortfolioSync({ type: 'experience-saved', experience: effectiveExp, experiences: exps });
        } catch (_) {}

        // 3. Non-blocking cloud update
        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                const cleanPayload = {};
                const allowedCols = ['role', 'company', 'duration', 'description', 'order_index'];
                allowedCols.forEach(col => {
                    if (exp[col] !== undefined) cleanPayload[col] = exp[col];
                });
                cleanPayload.location = taggedLocation;

                let savedRow = null;
                if (isValidUUID(exp.id)) {
                    const upRes = await withCloudTimeout(client.from('experiences').update(cleanPayload).eq('id', exp.id).select(), 2500);
                    if (!upRes.error && upRes.data && upRes.data.length > 0) {
                        savedRow = upRes.data[0];
                    }
                }
                if (!savedRow) {
                    if (isValidUUID(exp.id)) cleanPayload.id = exp.id;
                    const insRes = await withCloudTimeout(client.from('experiences').upsert(cleanPayload).select(), 2500);
                    if (!insRes.error && insRes.data && insRes.data.length > 0) {
                        savedRow = insRes.data[0];
                    }
                }
                if (savedRow) {
                    const cur = getLocalCollection('experiences', []);
                    const i = cur.findIndex(e => e.id === exp.id || e.id === savedRow.id);
                    if (i >= 0) {
                        cur[i] = { ...cur[i], ...savedRow, location: baseLocation, category: targetCategory, type: targetCategory };
                        setLocalCollection('experiences', cur);
                    }
                }
            } catch (err) {
                console.warn('[Supabase Cloud Sync] Experience save notice:', err.message || err);
            }
        })();

        return effectiveExp;
    },

    async reorderExperience(id, direction) {
        const exps = this.getLocalExperiences();
        const index = exps.findIndex(e => e.id === id);
        if (index === -1) return exps;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= exps.length) return exps;

        const temp = exps[index];
        exps[index] = exps[targetIndex];
        exps[targetIndex] = temp;

        exps.forEach((e, idx) => {
            e.order_index = idx + 1;
            e._modified_at = Date.now();
        });

        setLocalCollection('experiences', exps);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: exps[targetIndex] }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_experiences',
                newValue: JSON.stringify(exps)
            }));
            postPortfolioSync({ type: 'experience-reordered', experiences: exps });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                const updateItem = async (e) => {
                    if (isValidUUID(e.id)) {
                        await withCloudTimeout(client.from('experiences').update({ order_index: e.order_index }).eq('id', e.id), 2500);
                    }
                };
                await Promise.all([
                    updateItem(exps[index]),
                    updateItem(exps[targetIndex])
                ]);
            } catch (_) {}
        })();

        return exps;
    },

    async deleteExperience(id) {
        markDeleted('experiences', id);
        const exps = getLocalCollection('experiences', []).filter(e => e.id !== id);
        setLocalCollection('experiences', exps);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_experiences',
                newValue: JSON.stringify(exps)
            }));
            postPortfolioSync({ type: 'experience-deleted', id, experiences: exps });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('experiences').delete().eq('id', id), 2500);
                }
            } catch (_) {}
        })();

        return true;
    },

    // ═════════════════════════════════════════════════════════════
    // 3. REVIEWS
    // ═════════════════════════════════════════════════════════════
    async getApprovedReviews() {
        const local = this.getLocalReviews(true);

        const client = getSupabaseClient();
        if (client) {
            (async () => {
                try {
                    const { data, error } = await withCloudTimeout(
                        client.from('client_reviews').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
                        2500
                    );
                    if (!error && Array.isArray(data) && data.length > 0) {
                        const deleted = getDeletedIds('reviews').map(d => String(d).toLowerCase());
                        const filtered = data.filter(r => !deleted.includes(String(r.id).toLowerCase()));
                        if (filtered.length > 0) {
                            setLocalCollection('reviews', filtered);
                        }
                    }
                } catch (_) {}
            })();
        }

        return local;
    },

    async getAllReviews() {
        const local = this.getLocalReviews(false);

        const client = getSupabaseClient();
        if (client) {
            (async () => {
                try {
                    const { data, error } = await withCloudTimeout(
                        client.from('client_reviews').select('*').order('created_at', { ascending: false }),
                        2500
                    );
                    if (!error && Array.isArray(data) && data.length > 0) {
                        const deleted = getDeletedIds('reviews').map(d => String(d).toLowerCase());
                        const filtered = data.filter(r => !deleted.includes(String(r.id).toLowerCase()));
                        if (filtered.length > 0) {
                            setLocalCollection('reviews', filtered);
                        }
                    }
                } catch (_) {}
            })();
        }

        return local;
    },

    async submitReview(review) {
        const reviewStatus = (review && review.status === 'approved' && review.isAdmin) ? 'approved' : 'pending';
        const siteUrl = review.company_website || review.website || '';
        const newReview = {
            id: review.id || 'rev-' + Date.now(),
            client_name: review.client_name,
            client_title: review.client_title || '',
            client_company: review.client_company || '',
            company_website: siteUrl,
            rating: Number(review.rating) || 5,
            review_text: review.review_text,
            avatar_url: review.avatar_url || '',
            status: reviewStatus,
            is_featured: false,
            created_at: new Date().toISOString()
        };

        if (newReview.id) unmarkDeleted('reviews', newReview.id);

        const reviews = getLocalCollection('reviews', []);
        reviews.unshift(newReview);
        setLocalCollection('reviews', reviews);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: newReview }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_reviews',
                newValue: JSON.stringify(reviews)
            }));
            postPortfolioSync({ type: 'review-saved', review: newReview, reviews });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                const dbPayload = {
                    client_name: review.client_name,
                    client_title: review.client_title || '',
                    client_company: review.client_company || '',
                    company_website: siteUrl,
                    rating: Number(review.rating) || 5,
                    review_text: review.review_text,
                    avatar_url: review.avatar_url || '',
                    status: reviewStatus,
                    is_featured: false
                };
                let res = await withCloudTimeout(client.from('client_reviews').insert([dbPayload]).select(), 2500);
                if (res?.error) {
                    const { company_website, ...legacyPayload } = dbPayload;
                    res = await withCloudTimeout(client.from('client_reviews').insert([legacyPayload]).select(), 2500);
                }
                if (!res?.error && res?.data && res.data[0] && res.data[0].id) {
                    newReview.id = res.data[0].id;
                }
            } catch (_) {}
        })();

        return { success: true, review: newReview };
    },

    async updateReviewStatus(id, status) {
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        const target = reviews.find(r => r.id === id);
        if (target) {
            target.status = status;
            target._modified_at = Date.now();
            setLocalCollection('reviews', reviews);
        }

        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, status } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_reviews',
                newValue: JSON.stringify(reviews)
            }));
            postPortfolioSync({ type: 'review-saved', id, status, review: target, reviews });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('client_reviews').update({ status }).eq('id', id), 2500);
                }
            } catch (_) {}
        })();

        return target;
    },

    async deleteReview(id) {
        markDeleted('reviews', id);
        const reviews = getLocalCollection('reviews', []).filter(r => r.id !== id);
        setLocalCollection('reviews', reviews);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_reviews',
                newValue: JSON.stringify(reviews)
            }));
            postPortfolioSync({ type: 'review-deleted', id, reviews });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('client_reviews').delete().eq('id', id), 2500);
                }
            } catch (_) {}
        })();

        return true;
    },

    // ═════════════════════════════════════════════════════════════
    // 4. CONTACT MESSAGES
    // ═════════════════════════════════════════════════════════════
    async submitContactMessage(msg) {
        const record = {
            id: 'msg-' + Date.now(),
            name: msg.name,
            company: msg.company || '',
            email: msg.email,
            message: msg.message,
            website: msg.website || '',
            is_read: false,
            source: msg.source || 'contact_form',
            created_at: new Date().toISOString()
        };

        if (record.id) unmarkDeleted('messages', record.id);
        const messages = getLocalCollection('messages', []);
        const isDuplicate = messages.some(m => 
            m.id === record.id || 
            (m.email === record.email && m.message === record.message && Math.abs(new Date(m.created_at) - new Date(record.created_at)) < 60000)
        );
        if (!isDuplicate) {
            messages.unshift(record);
            setLocalCollection('messages', messages);
        }

        try {
            window.dispatchEvent(new CustomEvent('portfolio-message-received', { detail: record }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_messages',
                newValue: JSON.stringify(messages)
            }));
            postPortfolioSync({ type: 'message-received', message: record, messages });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (client) {
                try {
                    const dbPayload = {
                        name: msg.name,
                        company: msg.company || '',
                        email: msg.email,
                        message: msg.message,
                        website: msg.website || '',
                        is_read: false,
                        source: msg.source || 'contact_form'
                    };
                    const res = await withCloudTimeout(client.from('contact_messages').insert([dbPayload]), 2500);
                    if (res?.error) {
                        queuePendingMessage(dbPayload);
                    }
                } catch {
                    queuePendingMessage({
                        name: msg.name,
                        company: msg.company || '',
                        email: msg.email,
                        message: msg.message,
                        website: msg.website || '',
                        is_read: false,
                        source: msg.source || 'contact_form'
                    });
                }
            }
        })();

        // Personal email dispatch
        if (window.emailjs && SUPABASE_CONFIG.emailJsServiceId && SUPABASE_CONFIG.emailJsTemplateId) {
            try {
                window.emailjs.send(
                    SUPABASE_CONFIG.emailJsServiceId,
                    SUPABASE_CONFIG.emailJsTemplateId,
                    {
                        from_name: msg.name,
                        from_company: msg.company || 'N/A',
                        from_email: msg.email,
                        message: msg.message,
                        website: msg.website || 'N/A',
                        to_email: 'akshaychauhan003@gmail.com'
                    }
                ).catch(() => {});
            } catch (_) {}
        }

        const APPS_SCRIPT_WEBHOOK = 'https://script.google.com/macros/s/AKfycbzUp_KYLeOAclVztnPdwwYBoLNF00EIlh9sR82GNiYezu0M4svG_fFOHeafiQMZ1s4d/exec';
        try {
            fetch(APPS_SCRIPT_WEBHOOK, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: msg.name,
                    company: msg.company,
                    email: msg.email,
                    message: msg.message,
                    website: msg.website,
                    date: record.created_at
                })
            }).catch(() => {});
        } catch {}

        return { success: true, record };
    },

    async getMessages() {
        const local = this.getLocalMessages();

        const client = getSupabaseClient();
        if (client) {
            (async () => {
                try {
                    await flushPendingMessages(client);
                    const { data, error } = await withCloudTimeout(
                        client.from('contact_messages').select('*').order('created_at', { ascending: false }),
                        2500
                    );
                    if (!error && Array.isArray(data)) {
                        const deleted = getDeletedIds('messages').map(d => String(d).toLowerCase());
                        const messageMap = new Map();
                        data.forEach(m => {
                            if (m.id && deleted.includes(String(m.id).toLowerCase())) return;
                            const key = m.id || `${m.email}-${m.created_at}`;
                            messageMap.set(key, m);
                        });
                        local.forEach(m => {
                            if (m.id && deleted.includes(String(m.id).toLowerCase())) return;
                            const exists = Array.from(messageMap.values()).some(existing => 
                                existing.id === m.id || 
                                (existing.email === m.email && existing.message === m.message)
                            );
                            if (!exists) {
                                const key = m.id || `${m.email}-${m.created_at}`;
                                messageMap.set(key, m);
                            }
                        });
                        const merged = Array.from(messageMap.values()).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
                        setLocalCollection('messages', merged);
                    }
                } catch (_) {}
            })();
        }

        return local;
    },

    async markMessageRead(id) {
        const msgs = getLocalCollection('messages', []);
        const target = msgs.find(m => m.id === id);
        if (target) {
            target.is_read = true;
            setLocalCollection('messages', msgs);
        }

        try {
            window.dispatchEvent(new CustomEvent('portfolio-message-saved', { detail: { id, is_read: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_messages',
                newValue: JSON.stringify(msgs)
            }));
            postPortfolioSync({ type: 'message-read', id, messages: msgs });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('contact_messages').update({ is_read: true }).eq('id', id), 2500);
                }
            } catch (_) {}
        })();

        return true;
    },

    async deleteMessage(id) {
        markDeleted('messages', id);
        const msgs = getLocalCollection('messages', []).filter(m => m.id !== id);
        setLocalCollection('messages', msgs);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-message-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_messages',
                newValue: JSON.stringify(msgs)
            }));
            postPortfolioSync({ type: 'message-deleted', id, messages: msgs });
        } catch (_) {}

        (async () => {
            const client = getSupabaseClient();
            if (!client) return;
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('contact_messages').delete().eq('id', id), 2500);
                }
            } catch (_) {}
        })();

        return true;
    },

    // ═════════════════════════════════════════════════════════════
    // 5. ADMIN AUTHENTICATION
    // ═════════════════════════════════════════════════════════════
    async loginAdmin(email, password) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase client not initialized');
        const { data, error } = await withCloudTimeout(client.auth.signInWithPassword({ email, password }), 5000);
        if (error) throw error;
        localStorage.setItem('portfolio_console_unlocked', 'true');
        return data;
    },

    async logoutAdmin() {
        const client = getSupabaseClient();
        if (client) {
            try { await client.auth.signOut(); } catch (_) {}
        }
        localStorage.removeItem('portfolio_console_unlocked');
    },

    async getAdminSession() {
        const client = getSupabaseClient();
        if (!client) return null;
        try {
            const { data } = await withCloudTimeout(client.auth.getSession(), 2000);
            return data?.session || null;
        } catch (_) {
            return null;
        }
    },

    verifyAdminPin(enteredPin) {
        const currentPin = localStorage.getItem('portfolio_admin_pin') || atob('MjAyNg==');
        const isMatch = String(enteredPin).trim() === String(currentPin).trim();
        if (isMatch) {
            localStorage.setItem('portfolio_console_unlocked', 'true');
        }
        return isMatch;
    },

    setAdminPin(newPin) {
        if (!newPin || newPin.length < 4) throw new Error('PIN must be at least 4 digits');
        localStorage.setItem('portfolio_admin_pin', String(newPin).trim());
        return true;
    },

    isConsoleUnlocked() {
        return localStorage.getItem('portfolio_console_unlocked') === 'true';
    }
};

window.PortfolioData = PortfolioData;
window.SUPABASE_CONFIG = SUPABASE_CONFIG;
