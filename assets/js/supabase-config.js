/**
 * ════════════════════════════════════════════════════════════════
 * SUPABASE CLIENT & DATA PROVIDER FOR PORTFOLIO & DASHBOARD
 * ════════════════════════════════════════════════════════════════
 * Manages all cloud database interactions (Messages, Reviews,
 * Experiences, and Projects) with instant local fallback.
 */

const SUPABASE_CONFIG = {
    // Loaded dynamically from gitignored supabase-keys.js (never committed to Git):
    url: (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.url) || '',
    anonKey: (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.anonKey) || '',
    
    // EmailJS credentials for dual inbox delivery (optional):
    emailJsServiceId: (typeof window !== 'undefined' && window.EMAILJS_SERVICE_ID) || localStorage.getItem('portfolio_emailjs_service_id') || '',
    emailJsTemplateId: (typeof window !== 'undefined' && window.EMAILJS_TEMPLATE_ID) || localStorage.getItem('portfolio_emailjs_template_id') || '',
    emailJsPublicKey: (typeof window !== 'undefined' && window.EMAILJS_PUBLIC_KEY) || localStorage.getItem('portfolio_emailjs_public_key') || '',
};

// Initial Seed Fallback Data (ensures site is functional even before Supabase credentials are input)
const DEFAULT_FALLBACK_DATA = {
    projects: [
        {
            id: 'travoqix',
            slug: 'travoqix',
            title: 'Travoqix',
            category: 'Travel & Tourism · Production',
            description: 'Delhi-based live travel platform built for curated group tours, corporate getaways, and bespoke expeditions with frictionless booking flows, modern UI architecture, and cinematic presentation.',
            tech_stack: ['React', 'TypeScript', 'Node.js', 'REST APIs', 'Motion UI', 'Vercel'],
            live_url: 'https://travoqix.in/',
            github_url: '',
            video_url: 'assets/videos/Travoqix.mp4',
            preview_type: 'video',
            card_color: '#3d8bff',
            order_index: 1,
            is_active: true
        },
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
            category: 'Cyber Security',
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
            id: 'exp-1',
            role: 'Data Analyst Intern',
            company: 'CodSoft',
            location: 'Remote',
            duration: 'August 2025 — September 2025',
            description: 'Designed modular data analysis and visualization pipelines with Python (Pandas, NumPy, Matplotlib) and Excel, streamlining structured exploratory data analysis (EDA) and automated summary generation.',
            order_index: 1
        },
        {
            id: 'exp-2',
            role: 'Data Analyst Intern',
            company: 'Sunbuzz Media',
            location: 'Delhi, India',
            duration: 'January 2026 — February 2026',
            description: 'Built end-to-end Python and SQL data processing pipelines, created executive KPI dashboards in Power BI and Tableau, and uncovered high-impact engagement trends across digital media campaigns.',
            order_index: 2
        },
        {
            id: 'exp-3',
            role: 'Freelance Web Developer',
            company: 'Travoqix',
            location: 'Remote',
            duration: 'March 2026',
            description: 'Engineered a high-performance frontend foundation featuring responsive booking workflows, modern UI architecture, and dynamic video showcase deployed live at travoqix.in.',
            order_index: 3
        },
        {
            id: 'exp-4',
            role: 'Freelance Software Developer',
            company: 'Krisha Events',
            location: 'Remote',
            duration: 'September 2026 — Present',
            description: 'Architecting a unified cross-platform event & finance management application across desktop and mobile. Implemented centralized budget tracking, vendor contract management, and automated client billing workflows.',
            order_index: 4
        },
        {
            id: 'exp-5',
            role: 'AI/ML & API Developer Intern',
            company: 'Delhi e-Governance Society (DeGS)',
            location: 'Delhi, India',
            duration: 'August 2026 — Present',
            description: 'Engineered enterprise backend APIs with Java 17, Spring Boot, and Spring Data JPA to digitize ground-level employee records and field inspection reports. Integrated automated validation pipelines, MySQL persistence, and machine learning models to modernize government workflows.',
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
            created_at: '2026-03-15T10:00:00Z'
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

// Initialize Supabase Client if credentials exist
let supabaseClient = null;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    const url = SUPABASE_CONFIG.url;
    const key = SUPABASE_CONFIG.anonKey;
    if (url && key && window.supabase) {
        try {
            supabaseClient = window.supabase.createClient(url, key, {
                auth: {
                    persistSession: true,
                    autoRefreshToken: true,
                    detectSessionInUrl: true
                }
            });
        } catch (e) {
            console.warn('[Supabase] Initialization failed, falling back to local store:', e);
        }
    }
    return supabaseClient;
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

const PortfolioData = {
    // 1. Projects
    async getProjects() {
        let cloudProjects = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('projects')
                    .select('*')
                    .order('order_index', { ascending: true });
                if (!error && Array.isArray(data)) {
                    cloudProjects = data;
                }
            } catch (err) {
                console.warn('Using local fallback for projects:', err);
            }
        }

        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());

        // Build composite project list seeded with defaults
        const projectMap = new Map();
        DEFAULT_FALLBACK_DATA.projects.forEach(p => {
            const key = (p.slug || p.id || '').toLowerCase();
            if (!deleted.includes(key) && !deleted.includes(String(p.id).toLowerCase())) {
                projectMap.set(p.slug || p.id, { ...p });
            }
        });

        // Overlay local collection
        const localProjects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        if (Array.isArray(localProjects)) {
            localProjects.forEach(p => {
                const key = (p.slug || p.id || '').toLowerCase();
                if (!deleted.includes(key) && !deleted.includes(String(p.id).toLowerCase())) {
                    const origKey = p.slug || p.id;
                    projectMap.set(origKey, { ...(projectMap.get(origKey) || {}), ...p });
                }
            });
        }

        // Overlay cloud records (authoritative)
        if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
            cloudProjects.forEach(p => {
                const key = (p.slug || p.id || '').toLowerCase();
                if (!deleted.includes(key) && !deleted.includes(String(p.id).toLowerCase())) {
                    const origKey = p.slug || p.id;
                    projectMap.set(origKey, { ...(projectMap.get(origKey) || {}), ...p });
                }
            });
        }

        const merged = Array.from(projectMap.values())
            .filter(p => p.is_active !== false)
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));

        setLocalCollection('projects', merged);
        return merged;
    },

    async getAllProjectsForAdmin() {
        let cloudProjects = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('projects')
                    .select('*')
                    .order('order_index', { ascending: true });
                if (!error && Array.isArray(data)) {
                    cloudProjects = data;
                }
            } catch (err) {
                console.warn('Supabase getAllProjects error:', err);
            }
        }

        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());

        const projectMap = new Map();
        DEFAULT_FALLBACK_DATA.projects.forEach(p => {
            const key = (p.slug || p.id || '').toLowerCase();
            if (!deleted.includes(key) && !deleted.includes(String(p.id).toLowerCase())) {
                projectMap.set(p.slug || p.id, { ...p });
            }
        });

        const localProjects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        if (Array.isArray(localProjects)) {
            localProjects.forEach(p => {
                const key = (p.slug || p.id || '').toLowerCase();
                if (!deleted.includes(key) && !deleted.includes(String(p.id).toLowerCase())) {
                    const origKey = p.slug || p.id;
                    projectMap.set(origKey, { ...(projectMap.get(origKey) || {}), ...p });
                }
            });
        }

        if (Array.isArray(cloudProjects) && cloudProjects.length > 0) {
            cloudProjects.forEach(p => {
                const key = (p.slug || p.id || '').toLowerCase();
                if (!deleted.includes(key) && !deleted.includes(String(p.id).toLowerCase())) {
                    const origKey = p.slug || p.id;
                    projectMap.set(origKey, { ...(projectMap.get(origKey) || {}), ...p });
                }
            });
        }

        const merged = Array.from(projectMap.values())
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));

        setLocalCollection('projects', merged);
        return merged;
    },

    async saveProject(project) {
        if (project.slug) unmarkDeleted('projects', project.slug);
        if (project.id) unmarkDeleted('projects', project.id);

        const client = getSupabaseClient();
        let savedRow = null;
        if (client) {
            try {
                // Ensure only valid UUIDs are passed to PostgreSQL; omit custom string IDs so uuid_generate_v4() triggers
                const dbPayload = { ...project };
                if (!isValidUUID(dbPayload.id)) {
                    delete dbPayload.id;
                }
                const { data, error } = await client.from('projects').upsert(dbPayload, { onConflict: 'slug' }).select();
                if (!error && data && data.length > 0) {
                    savedRow = data[0];
                } else if (error) {
                    console.warn('Upsert project notice, retrying without card_color:', error.message || error);
                    const { card_color, ...safeProject } = dbPayload;
                    const retry = await client.from('projects').upsert(safeProject, { onConflict: 'slug' }).select();
                    if (!retry.error && retry.data && retry.data.length > 0) {
                        savedRow = retry.data[0];
                    }
                }
            } catch (e) {
                console.warn('Cloud save project notice, saving locally:', e);
            }
        }

        const effectiveProject = savedRow ? { ...project, ...savedRow } : project;
        const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const idx = projects.findIndex(p => (savedRow && p.id === savedRow.id) || p.slug === project.slug || p.id === project.id);
        if (idx >= 0) projects[idx] = { ...projects[idx], ...effectiveProject };
        else projects.push(effectiveProject);
        setLocalCollection('projects', projects);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: effectiveProject }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_projects',
                newValue: JSON.stringify(projects)
            }));
        } catch (_) {}
        return effectiveProject;
    },

    async deleteProject(id) {
        markDeleted('projects', id);
        const allProj = getLocalCollection('projects', []) || [];
        const proj = allProj.find(p => p.id === id || p.slug === id);
        if (proj) {
            if (proj.slug) markDeleted('projects', proj.slug);
            if (proj.id) markDeleted('projects', proj.id);
        }

        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await client.from('projects').delete().eq('id', id);
                }
                if (proj && proj.slug) {
                    await client.from('projects').delete().eq('slug', proj.slug);
                } else if (!isValidUUID(id)) {
                    await client.from('projects').delete().eq('slug', id);
                }
            } catch (e) {
                console.warn('Cloud delete project notice:', e);
            }
        }
        const projects = allProj.filter(p => p.id !== id && p.slug !== id && (proj ? p.slug !== proj.slug : true));
        setLocalCollection('projects', projects);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_projects',
                newValue: JSON.stringify(projects)
            }));
        } catch (_) {}
    },

    // 2. Experiences
    async getExperiences() {
        const deleted = getDeletedIds('experiences').map(d => String(d).toLowerCase());
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('experiences')
                    .select('*')
                    .order('order_index', { ascending: true });
                if (!error && Array.isArray(data) && data.length > 0) {
                    const filtered = data.filter(e => !deleted.includes(String(e.id).toLowerCase()));
                    setLocalCollection('experiences', filtered);
                    return filtered;
                }
            } catch (err) {
                console.warn('Using local fallback for experiences:', err);
            }
        }
        const local = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
        return (local || []).filter(e => !deleted.includes(String(e.id).toLowerCase()));
    },

    async saveExperience(exp) {
        if (exp.id) unmarkDeleted('experiences', exp.id);
        const client = getSupabaseClient();
        let savedRow = null;
        if (client) {
            try {
                const dbPayload = { ...exp };
                if (!isValidUUID(dbPayload.id)) {
                    delete dbPayload.id;
                }
                const { data, error } = await client.from('experiences').upsert(dbPayload).select();
                if (!error && data && data.length > 0) {
                    savedRow = data[0];
                }
            } catch (e) {
                console.warn('Cloud save experience notice, saving locally:', e);
            }
        }

        const effectiveExp = savedRow ? { ...exp, ...savedRow } : exp;
        const exps = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
        const idx = exps.findIndex(e => (savedRow && e.id === savedRow.id) || e.id === exp.id);
        if (idx >= 0) exps[idx] = { ...exps[idx], ...effectiveExp };
        else exps.push(effectiveExp);
        setLocalCollection('experiences', exps);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: effectiveExp }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_experiences',
                newValue: JSON.stringify(exps)
            }));
        } catch (_) {}
        return effectiveExp;
    },

    async deleteExperience(id) {
        markDeleted('experiences', id);
        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await client.from('experiences').delete().eq('id', id);
                }
            } catch (e) {
                console.warn('Cloud delete experience notice:', e);
            }
        }
        const exps = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences).filter(e => e.id !== id);
        setLocalCollection('experiences', exps);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_experiences',
                newValue: JSON.stringify(exps)
            }));
        } catch (_) {}
    },

    // 3. Reviews (Public & Admin)
    async getApprovedReviews() {
        let cloudReviews = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false });
                if (!error && Array.isArray(data) && data.length > 0) {
                    cloudReviews = data;
                }
            } catch (err) {
                console.warn('Supabase getApprovedReviews error:', err);
            }
        }

        if (cloudReviews.length > 0) {
            setLocalCollection('reviews', cloudReviews);
            return cloudReviews;
        }

        const localAll = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        return localAll.filter(r => r.status === 'approved');
    },

    async getAllReviews() {
        let cloudReviews = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('client_reviews')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error && Array.isArray(data) && data.length > 0) {
                    cloudReviews = data;
                }
            } catch (err) {
                console.warn('Supabase getAllReviews error:', err);
            }
        }
        if (cloudReviews.length > 0) {
            setLocalCollection('reviews', cloudReviews);
            return cloudReviews;
        }
        return getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
    },

    async submitReview(review) {
        // Enforce pending moderation status for public submissions
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

        const client = getSupabaseClient();
        if (client) {
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
                let res = await client.from('client_reviews').insert([dbPayload]).select();
                if (res.error) {
                    // In case remote column company_website does not exist yet, fallback gracefully
                    const { company_website, ...legacyPayload } = dbPayload;
                    res = await client.from('client_reviews').insert([legacyPayload]).select();
                }
                if (!res.error && res.data && res.data[0] && res.data[0].id) {
                    newReview.id = res.data[0].id;
                }
            } catch (e) {
                console.warn('Cloud review submission notice (saving locally):', e);
            }
        }

        // Always update local cache so review appears on screen instantly
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        reviews.unshift(newReview);
        setLocalCollection('reviews', reviews);

        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: newReview }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_reviews',
                newValue: JSON.stringify(reviews)
            }));
        } catch (_) {}

        return { success: true, review: newReview };
    },

    async updateReviewStatus(id, status) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { error } = await client.from('client_reviews').update({ status }).eq('id', id);
                if (error) console.warn('Supabase update review error:', error);
            } catch (e) {
                console.warn('Cloud review update failed:', e);
            }
        }
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews);
        const target = reviews.find(r => r.id === id);
        if (target) {
            target.status = status;
            setLocalCollection('reviews', reviews);
        }
        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, status } }));
        } catch (_) {}
    },

    async deleteReview(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { error } = await client.from('client_reviews').delete().eq('id', id);
                if (error) console.warn('Supabase delete review error:', error);
            } catch (e) {
                console.warn('Cloud review delete failed:', e);
            }
        }
        const reviews = getLocalCollection('reviews', DEFAULT_FALLBACK_DATA.reviews).filter(r => r.id !== id);
        setLocalCollection('reviews', reviews);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, deleted: true } }));
        } catch (_) {}
    },

    // 4. Contact Messages & Dual Email Delivery
    async submitContactMessage(msg) {
        let dbSuccess = false;
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
                const { error } = await client.from('contact_messages').insert([dbPayload]);
                if (!error) {
                    dbSuccess = true;
                } else {
                    console.warn('Supabase message insert error:', error);
                }
            } catch (e) {
                console.warn('Cloud message insert failed, using local store:', e);
            }
        }

        // Always save to local storage so the message is visible immediately in dashboard
        const messages = getLocalCollection('messages', []);
        const isDuplicate = messages.some(m => 
            m.id === record.id || 
            (m.email === record.email && m.message === record.message && Math.abs(new Date(m.created_at) - new Date(record.created_at)) < 60000)
        );
        if (!isDuplicate) {
            messages.unshift(record);
            setLocalCollection('messages', messages);
        }

        // Broadcast events across open dashboard windows, tabs, and apps
        try {
            window.dispatchEvent(new CustomEvent('portfolio-message-received', { detail: record }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_messages',
                newValue: JSON.stringify(messages)
            }));
        } catch (_) {}

        // Dual Delivery: Dispatch to Personal Email
        // 1. If EmailJS is loaded/configured:
        if (window.emailjs && SUPABASE_CONFIG.emailJsServiceId && SUPABASE_CONFIG.emailJsTemplateId) {
            try {
                await window.emailjs.send(
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
                );
            } catch (err) {
                console.warn('EmailJS delivery error:', err);
            }
        }

        // 2. Also forward to existing verified Apps Script fallback endpoint
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
        let cloudMessages = [];
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await client
                    .from('contact_messages')
                    .select('*')
                    .order('created_at', { ascending: false });
                if (!error && Array.isArray(data)) {
                    cloudMessages = data;
                }
            } catch (err) {
                console.warn('Using local fallback for messages:', err);
            }
        }

        const localMessages = getLocalCollection('messages', []);

        // Composite merge of cloud and local messages
        const messageMap = new Map();

        // 1. Insert cloud messages
        cloudMessages.forEach(m => {
            const key = m.id || `${m.email}-${m.created_at}`;
            messageMap.set(key, m);
        });

        // 2. Insert local messages (avoiding duplicate email+message)
        localMessages.forEach(m => {
            const exists = Array.from(messageMap.values()).some(existing => 
                existing.id === m.id || 
                (existing.email === m.email && existing.message === m.message)
            );
            if (!exists) {
                const key = m.id || `${m.email}-${m.created_at}`;
                messageMap.set(key, m);
            }
        });

        const merged = Array.from(messageMap.values()).sort((a, b) => {
            return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        });

        setLocalCollection('messages', merged);
        return merged;
    },

    async markMessageRead(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await client.from('contact_messages').update({ is_read: true }).eq('id', id);
                }
            } catch (e) {
                console.warn('Cloud message update failed:', e);
            }
        }
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
        } catch (_) {}
    },

    async deleteMessage(id) {
        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await client.from('contact_messages').delete().eq('id', id);
                }
            } catch (e) {
                console.warn('Cloud message delete failed:', e);
            }
        }
        const msgs = getLocalCollection('messages', []).filter(m => m.id !== id);
        setLocalCollection('messages', msgs);
        try {
            window.dispatchEvent(new CustomEvent('portfolio-message-saved', { detail: { id, deleted: true } }));
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'portfolio_messages',
                newValue: JSON.stringify(msgs)
            }));
        } catch (_) {}
    },

    // 5. Admin Authentication & Access Controls
    async loginAdmin(email, password) {
        const client = getSupabaseClient();
        if (!client) throw new Error('Supabase client not initialized');
        const { data, error } = await client.auth.signInWithPassword({ email, password });
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
            const { data } = await client.auth.getSession();
            return data?.session || null;
        } catch (_) {
            return null;
        }
    },

    verifyAdminPin(enteredPin) {
        const currentPin = localStorage.getItem('portfolio_admin_pin') || '2026';
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
