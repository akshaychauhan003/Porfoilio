/**
 * ════════════════════════════════════════════════════════════════
 * UNIFIED SUPABASE CLIENT & REALTIME SYNCHRONIZATION ENGINE
 * ════════════════════════════════════════════════════════════════
 * Powers live portfolio website, web dashboard, and Android APK.
 * Features:
 * • Instant Local Optimistic Updates (0ms latency UI)
 * • Authoritative Cloud PostgreSQL Persistence
 * • Real-Time Cross-Device WebSocket Sync (postgres_changes)
 * • Auto-Reconnection & Offline Resilient Queue
 * • Supabase Storage Public Media Upload
 * • Supabase Auth & Server-Enforced RLS Security
 */

const SUPABASE_FALLBACK_URL = 'https://vppkucipdfbshqxjwlcx.supabase.co';
const SUPABASE_FALLBACK_ANON_KEY = 'sb_publishable_D3V48ToGaEfKcz1j5TuosA_9ilWhesr';

const SUPABASE_CONFIG = {
    url: (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.url) || SUPABASE_FALLBACK_URL,
    anonKey: (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.anonKey) || SUPABASE_FALLBACK_ANON_KEY,
    emailJsServiceId: (typeof window !== 'undefined' && window.EMAILJS_SERVICE_ID) || (typeof localStorage !== 'undefined' && localStorage.getItem('portfolio_emailjs_service_id')) || '',
    emailJsTemplateId: (typeof window !== 'undefined' && window.EMAILJS_TEMPLATE_ID) || (typeof localStorage !== 'undefined' && localStorage.getItem('portfolio_emailjs_template_id')) || '',
    emailJsPublicKey: (typeof window !== 'undefined' && window.EMAILJS_PUBLIC_KEY) || (typeof localStorage !== 'undefined' && localStorage.getItem('portfolio_emailjs_public_key')) || ''
};

// ─────────────────────────────────────────────────────────────
// AUTHORITATIVE DEFAULT DATA (Used on zero-connection cold start)
// ─────────────────────────────────────────────────────────────
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
            order_index: 1,
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
            order_index: 2,
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
            order_index: 3,
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
            order_index: 4,
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
            order_index: 5,
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
            order_index: 6,
            is_active: true
        }
    ],
    experiences: [
        {
            id: '109f1ab7-67a5-4ad8-af12-0058cfe551aa',
            role: 'Data Analyst Intern',
            company: 'CodSoft',
            location: 'Remote',
            duration: 'August 2025 — September 2025',
            description: 'Designed modular data analysis and visualization pipelines with Python (Pandas, NumPy, Matplotlib) and Excel, streamlining structured exploratory data analysis (EDA) and automated summary generation.',
            category: 'office',
            type: 'office',
            video_url: '',
            live_url: '',
            order_index: 1,
            is_active: true
        },
        {
            id: '279dea07-d4ac-4c57-b4e1-b4bb692a766a',
            role: 'Data Analyst Intern',
            company: 'Sunbuzz Media',
            location: 'Delhi, India',
            duration: 'January 2025 — February 2025',
            description: 'Built end-to-end Python and SQL data processing pipelines, created executive KPI dashboards in Power BI and Tableau, and uncovered high-impact engagement trends across digital media campaigns.',
            category: 'office',
            type: 'office',
            video_url: '',
            live_url: '',
            order_index: 2,
            is_active: true
        },
        {
            id: '8a3da64e-84f8-49da-a467-1a4931d197bc',
            role: 'Freelance Web Developer',
            company: 'Travoqix',
            location: 'Remote',
            duration: 'March 2025',
            description: 'Engineered a high-performance frontend foundation featuring responsive booking workflows, modern UI architecture, and dynamic video showcase deployed live at travoqix.in.',
            category: 'freelance',
            type: 'freelance',
            video_url: 'assets/videos/Travoqix.mp4',
            live_url: 'https://travoqix.in/',
            order_index: 3,
            is_active: true
        },
        {
            id: '7ecd9a93-0c8a-43f4-bc46-1322af66ccbe',
            role: 'Freelance Software Developer',
            company: 'Krisha Events',
            location: 'Remote',
            duration: 'September 2025 — Present',
            description: 'Architecting a unified cross-platform event & finance management application across desktop and mobile. Implemented centralized budget tracking, vendor contract management, and automated client billing workflows.',
            category: 'freelance',
            type: 'freelance',
            video_url: '',
            live_url: '',
            order_index: 4,
            is_active: true
        },
        {
            id: 'c594690d-05af-4d13-b68b-716dc75277a6',
            role: 'AI/ML & API Developer Intern',
            company: 'Delhi e-Governance Society (DeGS)',
            location: 'Delhi, India',
            duration: 'August 2025 — Present',
            description: 'Engineered enterprise backend APIs with Java 17, Spring Boot, and Spring Data JPA to digitize ground-level employee records and field inspection reports. Integrated automated validation pipelines, MySQL persistence, and machine learning models to modernize government workflows.',
            category: 'office',
            type: 'office',
            video_url: '',
            live_url: '',
            order_index: 5,
            is_active: true
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
            company_website: '',
            rating: 5,
            review_text: 'Outstanding analytical and problem-solving capability. Delivered clean dashboards and automated repetitive data pipeline tasks with precision.',
            status: 'approved',
            is_featured: true,
            created_at: '2025-02-28T14:30:00Z'
        }
    ],
    messages: []
};

// ─────────────────────────────────────────────────────────────
// HELPERS & LOCAL CACHE ENGINE
// ─────────────────────────────────────────────────────────────
const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || ''));

function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const CLOUD_TIMEOUT_MS = 3500;
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

function getDeletedIds(collectionName) {
    if (typeof localStorage === 'undefined') return [];
    try {
        const raw = localStorage.getItem(`portfolio_deleted_${collectionName}`);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function markDeleted(collectionName, id) {
    if (typeof localStorage === 'undefined' || !id) return;
    try {
        const list = getDeletedIds(collectionName);
        const strId = String(id).toLowerCase();
        if (!list.map(s => String(s).toLowerCase()).includes(strId)) {
            list.push(id);
            localStorage.setItem(`portfolio_deleted_${collectionName}`, JSON.stringify(list));
        }
    } catch (_) {}
}

function unmarkDeleted(collectionName, id) {
    if (typeof localStorage === 'undefined' || !id) return;
    try {
        const list = getDeletedIds(collectionName);
        const strId = String(id).toLowerCase();
        const filtered = list.filter(item => String(item).toLowerCase() !== strId);
        localStorage.setItem(`portfolio_deleted_${collectionName}`, JSON.stringify(filtered));
    } catch (_) {}
}

function getLocalCollection(key, fallback = []) {
    if (typeof localStorage === 'undefined') return fallback;
    try {
        const raw = localStorage.getItem(`portfolio_${key}`);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function setLocalCollection(key, data) {
    if (typeof localStorage === 'undefined') return;
    try {
        localStorage.setItem(`portfolio_${key}`, JSON.stringify(data));
    } catch (e) {
        console.warn('LocalStorage write error:', e);
    }
}

// ─────────────────────────────────────────────────────────────
// INTER-TAB BROADCAST CHANNEL
// ─────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────
// SUPABASE CLIENT & REALTIME SUBSCRIPTION
// ─────────────────────────────────────────────────────────────
let supabaseClient = null;
let realtimeChannel = null;
let realtimeStatus = 'disconnected'; // 'connected' | 'connecting' | 'disconnected'
let reconnectTimer = null;

function getEffectiveSupabaseConfig() {
    const url = (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.url) || SUPABASE_CONFIG.url;
    const anonKey = (typeof window !== 'undefined' && window.SUPABASE_KEYS && window.SUPABASE_KEYS.anonKey) || SUPABASE_CONFIG.anonKey;
    return { url, anonKey };
}

function initRealtimeSubscription(client) {
    if (!client || typeof window === 'undefined') return;
    if (realtimeChannel) {
        try { client.removeChannel(realtimeChannel); } catch (_) {}
        realtimeChannel = null;
    }

    try {
        realtimeStatus = 'connecting';
        window.dispatchEvent(new CustomEvent('portfolio-sync-status', { detail: { status: 'connecting' } }));

        realtimeChannel = client
            .channel('realtime:portfolio_cloud_sync')
            // 1. Projects Table Changes
            .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, (payload) => {
                const eventType = payload.eventType; // 'INSERT', 'UPDATE', 'DELETE'
                const newRow = payload.new;
                const oldRow = payload.old;
                const project = newRow || oldRow;

                // Synchronize Local Cache
                const cached = getLocalCollection('projects', []);
                let updated = [...cached];

                if (eventType === 'DELETE') {
                    const delId = oldRow?.id;
                    const delSlug = oldRow?.slug;
                    updated = updated.filter(p => p.id !== delId && p.slug !== delSlug);
                    if (delId) markDeleted('projects', delId);
                    if (delSlug) markDeleted('projects', delSlug);
                } else if (newRow) {
                    const idx = updated.findIndex(p => p.id === newRow.id || (newRow.slug && p.slug === newRow.slug));
                    if (idx >= 0) {
                        updated[idx] = { ...updated[idx], ...newRow };
                    } else {
                        updated.push(newRow);
                    }
                    if (newRow.id) unmarkDeleted('projects', newRow.id);
                    if (newRow.slug) unmarkDeleted('projects', newRow.slug);
                }

                updated.sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
                setLocalCollection('projects', updated);

                // Dispatch reactive DOM update event across application
                window.dispatchEvent(new CustomEvent('portfolio-project-saved', {
                    detail: { ...project, eventType, source: 'realtime' }
                }));
                postPortfolioSync({
                    type: eventType === 'DELETE' ? 'project-deleted' : 'project-saved',
                    project,
                    id: project?.id,
                    slug: project?.slug,
                    source: 'realtime'
                });
            })
            // 2. Experiences Table Changes
            .on('postgres_changes', { event: '*', schema: 'public', table: 'experiences' }, (payload) => {
                const eventType = payload.eventType;
                const newRow = payload.new;
                const oldRow = payload.old;
                const exp = newRow || oldRow;

                const cached = getLocalCollection('experiences', []);
                let updated = [...cached];

                if (eventType === 'DELETE') {
                    const delId = oldRow?.id;
                    updated = updated.filter(e => e.id !== delId);
                    if (delId) markDeleted('experiences', delId);
                } else if (newRow) {
                    const parsed = PortfolioData._parseExperienceTrackAndLocation(newRow.location, newRow.role, newRow.company);
                    const normalized = {
                        ...newRow,
                        location: parsed.location,
                        category: newRow.category || parsed.category,
                        type: newRow.category || parsed.category
                    };
                    const idx = updated.findIndex(e => e.id === newRow.id);
                    if (idx >= 0) {
                        updated[idx] = { ...updated[idx], ...normalized };
                    } else {
                        updated.push(normalized);
                    }
                    if (newRow.id) unmarkDeleted('experiences', newRow.id);
                }

                updated.sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
                setLocalCollection('experiences', updated);

                window.dispatchEvent(new CustomEvent('portfolio-experience-saved', {
                    detail: { ...exp, eventType, source: 'realtime' }
                }));
                postPortfolioSync({
                    type: eventType === 'DELETE' ? 'experience-deleted' : 'experience-saved',
                    experience: exp,
                    id: exp?.id,
                    source: 'realtime'
                });
            })
            // 3. Client Reviews Table Changes
            .on('postgres_changes', { event: '*', schema: 'public', table: 'client_reviews' }, (payload) => {
                const eventType = payload.eventType;
                const newRow = payload.new;
                const oldRow = payload.old;
                const review = newRow || oldRow;

                const cached = getLocalCollection('reviews', []);
                let updated = [...cached];

                if (eventType === 'DELETE') {
                    const delId = oldRow?.id;
                    updated = updated.filter(r => r.id !== delId);
                    if (delId) markDeleted('reviews', delId);
                } else if (newRow) {
                    const idx = updated.findIndex(r => r.id === newRow.id);
                    if (idx >= 0) {
                        updated[idx] = { ...updated[idx], ...newRow };
                    } else {
                        updated.unshift(newRow);
                    }
                    if (newRow.id) unmarkDeleted('reviews', newRow.id);
                }

                setLocalCollection('reviews', updated);

                window.dispatchEvent(new CustomEvent('portfolio-review-saved', {
                    detail: { ...review, eventType, source: 'realtime' }
                }));
                postPortfolioSync({
                    type: eventType === 'DELETE' ? 'review-deleted' : 'review-saved',
                    review,
                    id: review?.id,
                    source: 'realtime'
                });
            })
            // 4. Contact Messages Table Changes (Cross-Device Admin Inbox)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_messages' }, (payload) => {
                const eventType = payload.eventType;
                const newRow = payload.new;
                const oldRow = payload.old;
                const message = newRow || oldRow;

                const cached = getLocalCollection('messages', []);
                let updated = [...cached];

                if (eventType === 'DELETE') {
                    const delId = oldRow?.id;
                    updated = updated.filter(m => m.id !== delId);
                    if (delId) markDeleted('messages', delId);
                } else if (newRow) {
                    const idx = updated.findIndex(m => m.id === newRow.id);
                    if (idx >= 0) {
                        updated[idx] = { ...updated[idx], ...newRow };
                    } else {
                        updated.unshift(newRow);
                    }
                    if (newRow.id) unmarkDeleted('messages', newRow.id);
                }

                setLocalCollection('messages', updated);

                // Dispatch event so Dashboard & APK react instantly without manual refresh
                window.dispatchEvent(new CustomEvent('portfolio-message-received', {
                    detail: { ...message, eventType, source: 'realtime' }
                }));
                postPortfolioSync({
                    type: eventType === 'DELETE' ? 'message-deleted' : 'message-received',
                    message,
                    id: message?.id,
                    source: 'realtime'
                });
            })
            .subscribe((status, err) => {
                if (status === 'SUBSCRIBED') {
                    realtimeStatus = 'connected';
                    window.dispatchEvent(new CustomEvent('portfolio-sync-status', { detail: { status: 'connected' } }));
                } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                    realtimeStatus = 'disconnected';
                    window.dispatchEvent(new CustomEvent('portfolio-sync-status', { detail: { status: 'disconnected', error: err } }));
                    scheduleRealtimeReconnect();
                }
            });
    } catch (e) {
        realtimeStatus = 'disconnected';
        window.dispatchEvent(new CustomEvent('portfolio-sync-status', { detail: { status: 'disconnected', error: e } }));
        scheduleRealtimeReconnect();
    }
}

function scheduleRealtimeReconnect() {
    if (reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        if (supabaseClient) {
            initRealtimeSubscription(supabaseClient);
        }
    }, 5000);
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
            window.SUPABASE_CLIENT = supabaseClient;
            initRealtimeSubscription(supabaseClient);
        } catch (e) {
            console.warn('[Supabase] Client init exception:', e);
        }
    }
    return supabaseClient;
}

// Auto-reconnect on network online and tab visibility
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        if (supabaseClient) initRealtimeSubscription(supabaseClient);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && supabaseClient && realtimeStatus !== 'connected') {
            initRealtimeSubscription(supabaseClient);
        }
    });
}

// ─────────────────────────────────────────────────────────────
// OFFLINE MESSAGE QUEUE
// ─────────────────────────────────────────────────────────────
function getPendingMessages() {
    if (typeof localStorage === 'undefined') return [];
    try {
        const raw = localStorage.getItem('portfolio_pending_messages');
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function queuePendingMessage(payload) {
    if (typeof localStorage === 'undefined') return;
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
            const { queued_at, ...clean } = msg;
            const res = await withCloudTimeout(client.from('contact_messages').insert([clean]), 3000);
            if (res?.error) remaining.push(msg);
        } catch {
            remaining.push(msg);
        }
    }
    try {
        localStorage.setItem('portfolio_pending_messages', JSON.stringify(remaining));
    } catch (_) {}
}

// ─────────────────────────────────────────────────────────────
// MAIN DATA ACCESS API (PortfolioData)
// ─────────────────────────────────────────────────────────────
const PortfolioData = {
    // ═════════════════════════════════════════════════════════
    // 0. CLIENT & STATUS GETTERS
    // ═════════════════════════════════════════════════════════
    getClient() {
        return getSupabaseClient();
    },

    getRealtimeStatus() {
        return realtimeStatus;
    },

    // ═════════════════════════════════════════════════════════
    // 1. INSTANT LOCAL GETTERS (0ms Synchronous Render)
    // ═════════════════════════════════════════════════════════
    getLocalProjects() {
        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
        const localProjects = getLocalCollection('projects', null);
        const resolved = (localProjects && localProjects.length > 0) ? localProjects : DEFAULT_FALLBACK_DATA.projects;
        return (resolved || [])
            .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()) && p.is_active !== false)
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
    },

    getLocalExperiences() {
        const deleted = getDeletedIds('experiences').map(d => String(d).toLowerCase());
        const local = getLocalCollection('experiences', null);
        const resolved = (local && local.length > 0) ? local : DEFAULT_FALLBACK_DATA.experiences;
        return (resolved || [])
            .filter(e => !deleted.includes(String(e.id).toLowerCase()) && e.is_active !== false)
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
        const local = getLocalCollection('reviews', null);
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

    // ═════════════════════════════════════════════════════════
    // 2. AUTHORITATIVE PROJECTS (Cloud with Local Fallback)
    // ═════════════════════════════════════════════════════════
    async getProjects({ forceCloud = false } = {}) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await withCloudTimeout(
                    client.from('projects').select('*').order('order_index', { ascending: true }),
                    CLOUD_TIMEOUT_MS
                );
                if (!error && Array.isArray(data)) {
                    const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
                    const active = data
                        .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()) && p.is_active !== false)
                        .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));

                    setLocalCollection('projects', data);
                    return active;
                }
            } catch (err) {
                console.warn('[Supabase] getProjects cloud query notice, using local cache:', err.message || err);
            }
        }
        return this.getLocalProjects();
    },

    async getAllProjectsForAdmin({ forceCloud = false } = {}) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await withCloudTimeout(
                    client.from('projects').select('*').order('order_index', { ascending: true }),
                    CLOUD_TIMEOUT_MS
                );
                if (!error && Array.isArray(data)) {
                    const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
                    const filtered = data
                        .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()))
                        .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
                    setLocalCollection('projects', data);
                    return filtered;
                }
            } catch (err) {
                console.warn('[Supabase] getAllProjectsForAdmin notice:', err.message || err);
            }
        }
        const local = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const deleted = getDeletedIds('projects').map(d => String(d).toLowerCase());
        return (local || [])
            .filter(p => !deleted.includes(String(p.id).toLowerCase()) && !deleted.includes(String(p.slug || '').toLowerCase()))
            .sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
    },

    async saveProject(project) {
        if (!project.slug) {
            project.slug = (project.title || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (project.slug) unmarkDeleted('projects', project.slug);
        if (project.id) unmarkDeleted('projects', project.id);

        project._modified_at = Date.now();

        // 1. Instant local state update
        const projects = getLocalCollection('projects', DEFAULT_FALLBACK_DATA.projects);
        const idx = projects.findIndex(p => (project.id && p.id === project.id) || p.slug === project.slug);
        if (idx >= 0) projects[idx] = { ...projects[idx], ...project };
        else projects.push(project);
        projects.sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
        setLocalCollection('projects', projects);

        // 2. Dispatch local event
        window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: project }));
        postPortfolioSync({ type: 'project-saved', project, projects });

        // 3. Persist to Supabase Cloud
        const client = getSupabaseClient();
        if (client) {
            try {
                const dbPayload = {
                    title: project.title,
                    slug: project.slug,
                    category: project.category || '',
                    description: project.description || '',
                    tech_stack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
                    live_url: project.live_url || '',
                    github_url: project.github_url || '',
                    video_url: project.video_url || '',
                    thumbnail_url: project.thumbnail_url || '',
                    preview_type: project.preview_type || (project.video_url ? 'video' : 'surface'),
                    card_color: project.card_color || '#3d8bff',
                    order_index: Number(project.order_index) || 0,
                    is_active: project.is_active !== false
                };

                let savedRow = null;
                if (isValidUUID(project.id)) {
                    const upRes = await withCloudTimeout(client.from('projects').update(dbPayload).eq('id', project.id).select(), 3000);
                    if (!upRes.error && upRes.data && upRes.data.length > 0) {
                        savedRow = upRes.data[0];
                    }
                }
                if (!savedRow && dbPayload.slug) {
                    const upRes = await withCloudTimeout(client.from('projects').update(dbPayload).eq('slug', dbPayload.slug).select(), 3000);
                    if (!upRes.error && upRes.data && upRes.data.length > 0) {
                        savedRow = upRes.data[0];
                    }
                }
                if (!savedRow) {
                    if (isValidUUID(project.id)) dbPayload.id = project.id;
                    const insRes = await withCloudTimeout(client.from('projects').upsert(dbPayload, { onConflict: 'slug' }).select(), 3000);
                    if (!insRes.error && insRes.data && insRes.data.length > 0) {
                        savedRow = insRes.data[0];
                    }
                }
                if (savedRow) {
                    const cur = getLocalCollection('projects', []);
                    const i = cur.findIndex(p => p.slug === project.slug || p.id === project.id);
                    if (i >= 0) {
                        cur[i] = { ...cur[i], ...savedRow };
                        setLocalCollection('projects', cur);
                    }
                    return savedRow;
                }
            } catch (err) {
                console.warn('[Supabase Cloud Sync] Project save warning:', err.message || err);
            }
        }
        return project;
    },

    async reorderProject(id, direction) {
        const projects = await this.getAllProjectsForAdmin();
        const index = projects.findIndex(p => p.id === id || p.slug === id);
        if (index === -1) return projects;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= projects.length) return projects;

        const temp = projects[index];
        projects[index] = projects[targetIndex];
        projects[targetIndex] = temp;

        projects.forEach((p, idx) => {
            p.order_index = idx + 1;
            p._modified_at = Date.now();
        });

        setLocalCollection('projects', projects);

        window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: projects[targetIndex] }));
        postPortfolioSync({ type: 'project-reordered', project: projects[targetIndex], projects });

        const client = getSupabaseClient();
        if (client) {
            try {
                const updateItem = async (p) => {
                    const match = isValidUUID(p.id) ? { id: p.id } : { slug: p.slug };
                    return withCloudTimeout(client.from('projects').update({ order_index: p.order_index }).match(match), 3000);
                };
                await Promise.all([
                    updateItem(projects[index]),
                    updateItem(projects[targetIndex])
                ]);
            } catch (_) {}
        }
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

        window.dispatchEvent(new CustomEvent('portfolio-project-saved', { detail: { id, deleted: true } }));
        postPortfolioSync({ type: 'project-deleted', id, slug: proj?.slug, projects });

        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('projects').delete().eq('id', id), 3000);
                }
                if (proj && proj.slug) {
                    await withCloudTimeout(client.from('projects').delete().eq('slug', proj.slug), 3000);
                } else if (!isValidUUID(id)) {
                    await withCloudTimeout(client.from('projects').delete().eq('slug', id), 3000);
                }
            } catch (err) {
                console.warn('[Supabase] Delete project error:', err);
            }
        }
        return true;
    },

    // ═════════════════════════════════════════════════════════
    // 3. AUTHORITATIVE EXPERIENCES (Office & Freelance)
    // ═════════════════════════════════════════════════════════
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
            if (c.includes('travoqix') || c.includes('krisha') || r.includes('freelance')) {
                category = 'freelance';
            } else {
                category = 'office';
            }
        }
        return { category, location: cleanLocation };
    },

    async getExperiences({ forceCloud = false } = {}) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await withCloudTimeout(
                    client.from('experiences').select('*').order('order_index', { ascending: true }),
                    CLOUD_TIMEOUT_MS
                );
                if (!error && Array.isArray(data)) {
                    const deleted = getDeletedIds('experiences').map(d => String(d).toLowerCase());
                    const filtered = data.filter(e => !deleted.includes(String(e.id).toLowerCase()) && e.is_active !== false);
                    const enriched = filtered.map(cloudExp => {
                        const parsed = this._parseExperienceTrackAndLocation(cloudExp.location, cloudExp.role, cloudExp.company);
                        return {
                            ...cloudExp,
                            location: parsed.location,
                            category: cloudExp.category || parsed.category,
                            type: cloudExp.category || parsed.category
                        };
                    });
                    setLocalCollection('experiences', enriched);
                    return enriched;
                }
            } catch (err) {
                console.warn('[Supabase] getExperiences notice:', err.message || err);
            }
        }
        return this.getLocalExperiences();
    },

    async saveExperience(exp) {
        const isFreelance = exp.category === 'freelance' || exp.type === 'freelance';
        const targetCategory = isFreelance ? 'freelance' : 'office';
        const baseLocation = String(exp.location || '').replace(/\s*\[(freelance|office)\]\s*/gi, '').trim();
        const validId = isValidUUID(exp.id) ? exp.id : generateUUID();

        if (validId) unmarkDeleted('experiences', validId);

        const effectiveExp = {
            ...exp,
            id: validId,
            location: baseLocation,
            category: targetCategory,
            type: targetCategory,
            video_url: exp.video_url || '',
            live_url: exp.live_url || '',
            order_index: Number(exp.order_index) || 0,
            is_active: exp.is_active !== false,
            _modified_at: Date.now()
        };

        // 1. Instant local update
        const exps = getLocalCollection('experiences', DEFAULT_FALLBACK_DATA.experiences);
        const idx = exps.findIndex(e => e.id === validId || (e.role === exp.role && e.company === exp.company));
        if (idx >= 0) exps[idx] = { ...exps[idx], ...effectiveExp };
        else exps.push(effectiveExp);
        exps.sort((a, b) => (Number(a.order_index) || 0) - (Number(b.order_index) || 0));
        setLocalCollection('experiences', exps);

        // 2. Multi-tab and local DOM broadcast
        window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: effectiveExp }));
        postPortfolioSync({ type: 'experience-saved', experience: effectiveExp, experiences: exps });

        // 3. Supabase Cloud PostgreSQL Write
        const client = getSupabaseClient();
        if (client) {
            try {
                const dbPayload = {
                    id: validId,
                    role: exp.role,
                    company: exp.company,
                    location: baseLocation,
                    duration: exp.duration,
                    description: exp.description || '',
                    category: targetCategory,
                    video_url: exp.video_url || '',
                    live_url: exp.live_url || '',
                    order_index: Number(exp.order_index) || 0,
                    is_active: exp.is_active !== false
                };

                let savedRow = null;
                // Try update first
                const upRes = await withCloudTimeout(client.from('experiences').update(dbPayload).eq('id', validId).select(), 3000);
                if (!upRes.error && upRes.data && upRes.data.length > 0) {
                    savedRow = upRes.data[0];
                }
                // If row didn't exist yet, insert
                if (!savedRow) {
                    const insRes = await withCloudTimeout(client.from('experiences').insert([dbPayload]).select(), 3000);
                    if (!insRes.error && insRes.data && insRes.data.length > 0) {
                        savedRow = insRes.data[0];
                    }
                }
                if (savedRow) {
                    const cur = getLocalCollection('experiences', []);
                    const i = cur.findIndex(e => e.id === validId);
                    if (i >= 0) {
                        cur[i] = { ...cur[i], ...savedRow };
                        setLocalCollection('experiences', cur);
                    }
                    return savedRow;
                }
            } catch (err) {
                console.warn('[Supabase Cloud Sync] Experience save error:', err.message || err);
            }
        }
        return effectiveExp;
    },

    async reorderExperience(id, direction) {
        const exps = await this.getExperiences();
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

        window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: exps[targetIndex] }));
        postPortfolioSync({ type: 'experience-reordered', experiences: exps });

        const client = getSupabaseClient();
        if (client) {
            try {
                const updateItem = async (e) => {
                    if (isValidUUID(e.id)) {
                        return withCloudTimeout(client.from('experiences').update({ order_index: e.order_index }).eq('id', e.id), 3000);
                    }
                };
                await Promise.all([
                    updateItem(exps[index]),
                    updateItem(exps[targetIndex])
                ]);
            } catch (_) {}
        }
        return exps;
    },

    async deleteExperience(id) {
        markDeleted('experiences', id);
        const exps = getLocalCollection('experiences', []).filter(e => e.id !== id);
        setLocalCollection('experiences', exps);

        window.dispatchEvent(new CustomEvent('portfolio-experience-saved', { detail: { id, deleted: true } }));
        postPortfolioSync({ type: 'experience-deleted', id, experiences: exps });

        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('experiences').delete().eq('id', id), 3000);
                }
            } catch (err) {
                console.warn('[Supabase] Delete experience error:', err);
            }
        }
        return true;
    },

    // ═════════════════════════════════════════════════════════
    // 4. CLIENT REVIEWS (Moderation, Ratings & Testimonials)
    // ═════════════════════════════════════════════════════════
    async getApprovedReviews({ forceCloud = false } = {}) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await withCloudTimeout(
                    client.from('client_reviews').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
                    CLOUD_TIMEOUT_MS
                );
                if (!error && Array.isArray(data)) {
                    const deleted = getDeletedIds('reviews').map(d => String(d).toLowerCase());
                    const filtered = data.filter(r => !deleted.includes(String(r.id).toLowerCase()));
                    setLocalCollection('reviews', filtered);
                    return filtered;
                }
            } catch (err) {
                console.warn('[Supabase] getApprovedReviews notice:', err.message || err);
            }
        }
        return this.getLocalReviews(true);
    },

    async getAllReviews({ forceCloud = false } = {}) {
        const client = getSupabaseClient();
        if (client) {
            try {
                const { data, error } = await withCloudTimeout(
                    client.from('client_reviews').select('*').order('created_at', { ascending: false }),
                    CLOUD_TIMEOUT_MS
                );
                if (!error && Array.isArray(data)) {
                    const deleted = getDeletedIds('reviews').map(d => String(d).toLowerCase());
                    const filtered = data.filter(r => !deleted.includes(String(r.id).toLowerCase()));
                    setLocalCollection('reviews', filtered);
                    return filtered;
                }
            } catch (err) {
                console.warn('[Supabase] getAllReviews notice:', err.message || err);
            }
        }
        return this.getLocalReviews(false);
    },

    async submitReview(review) {
        const reviewStatus = (review && review.status === 'approved' && review.isAdmin) ? 'approved' : 'pending';
        const siteUrl = review.company_website || review.website || '';
        const validId = isValidUUID(review.id) ? review.id : generateUUID();

        const newReview = {
            id: validId,
            client_name: review.client_name,
            client_title: review.client_title || '',
            client_company: review.client_company || '',
            company_website: siteUrl,
            rating: Number(review.rating) || 5,
            review_text: review.review_text,
            avatar_url: review.avatar_url || '',
            status: reviewStatus,
            is_featured: review.is_featured === true,
            created_at: new Date().toISOString()
        };

        unmarkDeleted('reviews', validId);

        const reviews = getLocalCollection('reviews', []);
        reviews.unshift(newReview);
        setLocalCollection('reviews', reviews);

        window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: newReview }));
        postPortfolioSync({ type: 'review-saved', review: newReview, reviews });

        const client = getSupabaseClient();
        if (client) {
            try {
                const dbPayload = {
                    id: validId,
                    client_name: review.client_name,
                    client_title: review.client_title || '',
                    client_company: review.client_company || '',
                    company_website: siteUrl,
                    rating: Number(review.rating) || 5,
                    review_text: review.review_text,
                    avatar_url: review.avatar_url || '',
                    status: reviewStatus,
                    is_featured: review.is_featured === true
                };
                const res = await withCloudTimeout(client.from('client_reviews').insert([dbPayload]).select(), 3000);
                if (!res?.error && res?.data && res.data[0]) {
                    return { success: true, review: res.data[0] };
                }
            } catch (err) {
                console.warn('[Supabase] submitReview error:', err);
            }
        }
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

        window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, status } }));
        postPortfolioSync({ type: 'review-saved', id, status, review: target, reviews });

        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('client_reviews').update({ status }).eq('id', id), 3000);
                }
            } catch (err) {
                console.warn('[Supabase] updateReviewStatus error:', err);
            }
        }
        return target;
    },

    async deleteReview(id) {
        markDeleted('reviews', id);
        const reviews = getLocalCollection('reviews', []).filter(r => r.id !== id);
        setLocalCollection('reviews', reviews);

        window.dispatchEvent(new CustomEvent('portfolio-review-saved', { detail: { id, deleted: true } }));
        postPortfolioSync({ type: 'review-deleted', id, reviews });

        const client = getSupabaseClient();
        if (client) {
            try {
                if (isValidUUID(id)) {
                    await withCloudTimeout(client.from('client_reviews').delete().eq('id', id), 3000);
                }
            } catch (err) {
                console.warn('[Supabase] deleteReview error:', err);
            }
        }
        return true;
    },

    // ═════════════════════════════════════════════════════════
    // 5. CONTACT MESSAGES (Inbox & Dual Notification Delivery)
    // ═════════════════════════════════════════════════════════
    async submitContactMessage(msg) {
        const validId = generateUUID();
        const record = {
            id: validId,
            name: msg.name,
            company: msg.company || '',
            email: msg.email,
            message: msg.message,
            website: msg.website || '',
            is_read: false,
            source: msg.source || 'contact_form',
            created_at: new Date().toISOString()
        };

        unmarkDeleted('messages', validId);

        const messages = getLocalCollection('messages', []);
        messages.unshift(record);
        setLocalCollection('messages', messages);

        window.dispatchEvent(new CustomEvent('portfolio-message-received', { detail: record }));
        postPortfolioSync({ type: 'message-received', message: record, messages });

        const client = getSupabaseClient();
        if (client) {
            try {
                const dbPayload = {
                    id: validId,
                    name: msg.name,
                    company: msg.company || '',
                    email: msg.email,
                    message: msg.message,
                    website: msg.website || '',
                    is_read: false,
                    source: msg.source || 'contact_form'
                };
                const res = await withCloudTimeout(client.from('contact_messages').insert([dbPayload]), 3000);
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

        // EmailJS optional dual transmission
        if (typeof window !== 'undefined' && window.emailjs && SUPABASE_CONFIG.emailJsServiceId && SUPABASE_CONFIG.emailJsTemplateId) {
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

        return { success: true, record };
    },

    async getMessages({ forceCloud = false } = {}) {
        const client = getSupabaseClient();
        if (client) {
            try {
                await flushPendingMessages(client);
                const { data, error } = await withCloudTimeout(
                    client.from('contact_messages').select('*').order('created_at', { ascending: false }),
                    CLOUD_TIMEOUT_MS
                );
                if (!error && Array.isArray(data)) {
                    const deleted = getDeletedIds('messages').map(d => String(d).toLowerCase());
                    const filtered = data.filter(m => !deleted.includes(String(m.id).toLowerCase()));
                    setLocalCollection('messages', filtered);
                    return filtered;
                }
            } catch (err) {
                console.warn('[Supabase] getMessages notice:', err.message || err);
            }
        }
        return this.getLocalMessages();
    },

    async markMessageRead(id) {
        const msgs = getLocalCollection('messages', []);
        const target = msgs.find(m => m.id === id);
        if (target) {
            target.is_read = true;
            setLocalCollection('messages', msgs);
        }

        window.dispatchEvent(new CustomEvent('portfolio-message-saved', { detail: { id, is_read: true } }));
        postPortfolioSync({ type: 'message-read', id, messages: msgs });

        const client = getSupabaseClient();
        if (client && isValidUUID(id)) {
            try {
                await withCloudTimeout(client.from('contact_messages').update({ is_read: true }).eq('id', id), 3000);
            } catch (_) {}
        }
        return true;
    },

    async deleteMessage(id) {
        markDeleted('messages', id);
        const msgs = getLocalCollection('messages', []).filter(m => m.id !== id);
        setLocalCollection('messages', msgs);

        window.dispatchEvent(new CustomEvent('portfolio-message-saved', { detail: { id, deleted: true } }));
        postPortfolioSync({ type: 'message-deleted', id, messages: msgs });

        const client = getSupabaseClient();
        if (client && isValidUUID(id)) {
            try {
                await withCloudTimeout(client.from('contact_messages').delete().eq('id', id), 3000);
            } catch (_) {}
        }
        return true;
    },

    // ═════════════════════════════════════════════════════════
    // 6. CLOUD STORAGE (Media & Video Showcase Upload)
    // ═════════════════════════════════════════════════════════
    async uploadMedia(file, folder = 'videos') {
        const client = getSupabaseClient();
        if (!client || !client.storage) {
            throw new Error('Supabase Storage is not initialized');
        }

        // Limit file size to 50MB
        const maxMB = 50;
        if (file.size > maxMB * 1024 * 1024) {
            throw new Error(`File size exceeds ${maxMB}MB limit`);
        }

        const ext = file.name.split('.').pop() || 'mp4';
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storagePath = `${folder}/${Date.now()}-${cleanName}`;

        const { data, error } = await client.storage
            .from('portfolio-media')
            .upload(storagePath, file, { upsert: true, cacheControl: '3600' });

        if (error) {
            throw error;
        }

        const { data: pubData } = client.storage
            .from('portfolio-media')
            .getPublicUrl(storagePath);

        if (!pubData || !pubData.publicUrl) {
            throw new Error('Failed to generate public URL for uploaded media');
        }

        return {
            publicUrl: pubData.publicUrl,
            path: storagePath
        };
    },

    // ═════════════════════════════════════════════════════════
    // 7. SECURITY & SUPABASE AUTHENTICATION
    // ═════════════════════════════════════════════════════════
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
window.SUPABASE_CLIENT = getSupabaseClient();
