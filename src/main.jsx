import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

const STORAGE_KEY = 'projects-showcase-data-v1'
const seedProjects = [
  { id: 'p-1', title: 'Landing page для онлайн-курса', description: 'Создать выразительную посадочную страницу для нового образовательного продукта.', status: 'В работе', priority: 'Высокий', category: 'Web', dueDate: '2026-10-05', progress: 65, color: 'teal' },
  { id: 'p-2', title: 'Интернет-магазин одежды', description: 'Собрать удобный каталог с фильтрами, корзиной и адаптивной версией.', status: 'В работе', priority: 'Средний', category: 'E-commerce', dueDate: '2026-10-18', progress: 38, color: 'slate' },
  { id: 'p-3', title: 'Мобильное приложение для заметок', description: 'Прототип приложения для быстрого создания и поиска личных заметок.', status: 'Черновик', priority: 'Низкий', category: 'Mobile', dueDate: '2026-11-02', progress: 18, color: 'blue' },
  { id: 'p-4', title: 'Портфолио фотографа', description: 'Минималистичный сайт с галереей, услугами и формой записи на съёмку.', status: 'Завершён', priority: 'Высокий', category: 'Portfolio', dueDate: '2026-09-20', progress: 100, color: 'mint' },
  { id: 'p-5', title: 'Сервис бронирования студий', description: 'Создать сервис, который помогает находить и бронировать творческие пространства.', status: 'На паузе', priority: 'Средний', category: 'Product', dueDate: '2026-10-28', progress: 54, color: 'aqua' },
]
const statusOptions = ['В работе', 'Черновик', 'Завершён', 'На паузе']
const emptyForm = { title: '', description: '', status: 'В работе', priority: 'Средний', category: 'Web', dueDate: '', progress: 0, color: 'teal' }

function loadProjects() {
  try { const saved = localStorage.getItem(STORAGE_KEY); if (!saved) return seedProjects; const parsed = JSON.parse(saved); return Array.isArray(parsed) ? parsed : seedProjects } catch { return seedProjects }
}
function Icon({ name, size = 20 }) {
  const paths = { search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>, plus: <path d="M12 5v14M5 12h14" />, grid: <><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></>, bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />, chevron: <path d="m6 9 6 6 6-6" />, close: <path d="m6 6 12 12M18 6 6 18" />, edit: <><path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z" /><path d="m13.5 6.5 4 4" /></>, trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3" /></>, check: <path d="m5 12 4 4L19 6" />, calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>, sparkle: <path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z" /> }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
function statusClass(status) {
  const classes = { 'В работе': 'in-progress', 'Черновик': 'draft', 'Завершён': 'completed', 'На паузе': 'paused' }
  return classes[status] || 'draft'
}
function priorityClass(priority) {
  const classes = { 'Высокий': 'high', 'Средний': 'medium', 'Низкий': 'low' }
  return classes[priority] || 'medium'
}
function formatDate(value) { if (!value) return 'Без дедлайна'; return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(`${value}T00:00:00`)).replace('.', '') }

function App() {
  const [projects, setProjects] = useState(loadProjects)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('Все проекты')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const titleRef = useRef(null)
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(projects)) }, [projects])
  useEffect(() => { if (modalOpen) setTimeout(() => titleRef.current?.focus(), 50) }, [modalOpen])
  useEffect(() => { if (!toast) return undefined; const timer = setTimeout(() => setToast(null), 3000); return () => clearTimeout(timer) }, [toast])
  useEffect(() => { const close = (event) => { if (event.key === 'Escape' && modalOpen && !deletingId) setModalOpen(false) }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close) }, [modalOpen, deletingId])
  const filtered = useMemo(() => projects.filter((project) => [project.title, project.description, project.category, project.status].join(' ').toLowerCase().includes(query.trim().toLowerCase()) && (filter === 'Все проекты' || project.status === filter)), [projects, query, filter])
  const activeCount = projects.filter((project) => project.status === 'В работе').length
  const completedCount = projects.filter((project) => project.status === 'Завершён').length
  const totalProgress = projects.length ? Math.round(projects.reduce((sum, project) => sum + project.progress, 0) / projects.length) : 0
  function openCreate() { setEditingId(null); setForm(emptyForm); setErrors({}); setModalOpen(true) }
  function openEdit(project) { setEditingId(project.id); setForm(project); setErrors({}); setModalOpen(true) }
  function closeModal() { if (!deletingId) { setModalOpen(false); setErrors({}) } }
  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: '' })) }
  function validate() { const next = {}; if (!form.title.trim()) next.title = 'Введите название проекта'; if (!form.description.trim()) next.description = 'Добавьте короткое описание'; if (form.progress < 0 || form.progress > 100) next.progress = 'Укажите значение от 0 до 100'; return next }
  function saveProject(event) { event.preventDefault(); const nextErrors = validate(); if (Object.keys(nextErrors).length) { setErrors(nextErrors); return }; const normalized = { ...form, title: form.title.trim(), description: form.description.trim(), progress: Number(form.progress) }; if (editingId) { setProjects((current) => current.map((project) => project.id === editingId ? { ...normalized, id: editingId } : project)); setToast('Изменения сохранены') } else { setProjects((current) => [{ ...normalized, id: `p-${Date.now()}` }, ...current]); setToast('Новый проект создан') }; setModalOpen(false) }
  function confirmDelete() { setProjects((current) => current.filter((project) => project.id !== deletingId)); setDeletingId(null); setToast('Проект удалён') }
  return <div className="app-shell">
    <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><Icon name="sparkle" size={17} /></span><span>projects<span className="brand-dot">.</span></span></a><div className="topbar-actions"><button className="icon-button notification" aria-label="Уведомления"><Icon name="bell" size={20} /><span className="notification-dot" /></button><div className="avatar">А</div><span className="user-name">Алексей</span></div></header>
    <main id="top" className="main-content">
      <section className="hero"><div><p className="eyebrow">Рабочее пространство <span className="live-dot" /></p><h1>Ваши проекты <span className="wave">✦</span></h1><p className="hero-subtitle">Всё важное — в одном месте. Продолжайте создавать.</p></div></section>
      <section className="stats"><div className="stat-card"><span className="stat-label">Всего проектов</span><strong>{projects.length}</strong><span className="stat-caption">в вашем workspace</span></div><div className="stat-card"><span className="stat-label">В работе</span><strong>{activeCount}</strong><span className="stat-caption accent-green">● активные сейчас</span></div><div className="stat-card"><span className="stat-label">Завершено</span><strong>{completedCount}</strong><span className="stat-caption">● за всё время</span></div><div className="stat-card progress-stat"><span className="stat-label">Общий прогресс</span><strong>{totalProgress}<small>%</small></strong><div className="mini-progress"><i style={{ width: `${totalProgress}%` }} /></div></div></section>
      <section className="workspace"><div className="section-heading"><div><h2>Все проекты <span>{filtered.length}</span></h2><p>Управляйте идеями и отслеживайте прогресс</p></div></div><div className="toolbar"><label className="search-box"><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти проект..." aria-label="Поиск проектов" />{query && <button onClick={() => setQuery('')} aria-label="Очистить поиск"><Icon name="close" size={15} /></button>}</label><label className="select-wrap"><select aria-label="Фильтр по статусу" value={filter} onChange={(event) => setFilter(event.target.value)}><option>Все проекты</option>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select><Icon name="chevron" size={16} /></label><button className="create-button" onClick={openCreate}><span className="cta-icon"><Icon name="plus" size={18} /></span><span>Создать проект</span></button></div>
      {filtered.length ? <div className="project-grid">{filtered.map((project, index) => <article className={`project-card ${project.color}`} key={project.id} style={{ '--delay': `${index * 45}ms` }}><div className="card-top"><span className={`status ${statusClass(project.status)}`}><i />{project.status}</span><button className="card-menu" aria-label="Редактировать проект" onClick={() => openEdit(project)}>•••</button></div><div className="card-art"><span className="art-glow" /><span className="art-shape shape-one" /><span className="art-shape shape-two" /><span className="art-symbol">✦</span></div><div className="card-body"><span className="category">{project.category}</span><h3>{project.title}</h3><p>{project.description}</p><div className="card-meta"><span><Icon name="calendar" size={15} />{formatDate(project.dueDate)}</span><span className={`priority ${priorityClass(project.priority)}`}>{project.priority}</span></div><div className="progress-line"><div><span>Прогресс</span><b>{project.progress}%</b></div><div className="progress-track"><i style={{ width: `${project.progress}%` }} /></div></div><div className="card-actions"><button onClick={() => openEdit(project)}><Icon name="edit" size={16} />Редактировать</button><button className="delete" onClick={() => setDeletingId(project.id)} aria-label="Удалить проект"><Icon name="trash" size={16} /></button></div></div></article>)}</div> : <div className="empty-state"><div className="empty-icon"><Icon name="search" size={25} /></div><h3>Ничего не нашли</h3><p>Попробуйте изменить запрос или фильтр.</p><button onClick={() => { setQuery(''); setFilter('Все проекты') }}>Сбросить фильтры</button></div>}</section>
    </main>
    {modalOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}><section className="modal" role="dialog" aria-modal="true"><div className="modal-header"><div><span className="modal-kicker">{editingId ? 'Редактирование' : 'Новый проект'}</span><h2>{editingId ? 'Редактировать проект' : 'Создать проект'}</h2></div><button className="icon-button" onClick={closeModal} aria-label="Закрыть форму"><Icon name="close" size={20} /></button></div><form onSubmit={saveProject}><div className="form-grid"><label className={errors.title ? 'field has-error' : 'field'}><span>Название проекта <b>*</b></span><input ref={titleRef} value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Например, новый лендинг" />{errors.title && <small>{errors.title}</small>}</label><label className="field"><span>Категория</span><select value={form.category} onChange={(event) => updateField('category', event.target.value)}><option>Web</option><option>E-commerce</option><option>Mobile</option><option>Portfolio</option><option>Product</option></select></label><label className={errors.description ? 'field full has-error' : 'field full'}><span>Описание <b>*</b></span><textarea value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Что нужно сделать в рамках проекта?" rows="3" />{errors.description && <small>{errors.description}</small>}</label><label className="field"><span>Статус</span><select value={form.status} onChange={(event) => updateField('status', event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label><label className="field"><span>Приоритет</span><select value={form.priority} onChange={(event) => updateField('priority', event.target.value)}><option>Высокий</option><option>Средний</option><option>Низкий</option></select></label><label className="field"><span>Дедлайн</span><input type="date" value={form.dueDate} onChange={(event) => updateField('dueDate', event.target.value)} /></label><label className={errors.progress ? 'field has-error' : 'field'}><span>Прогресс, %</span><input type="number" min="0" max="100" value={form.progress} onChange={(event) => updateField('progress', event.target.value)} />{errors.progress && <small>{errors.progress}</small>}</label></div><div className="modal-footer"><button type="button" className="cancel" onClick={closeModal}>Отмена</button><button className="save" type="submit"><span className="cta-icon"><Icon name="check" size={17} /></span><span>{editingId ? 'Сохранить изменения' : 'Создать проект'}</span></button></div></form></section></div>}
    {deletingId && <div className="modal-backdrop"><section className="confirm" role="alertdialog" aria-modal="true"><div className="confirm-icon"><Icon name="trash" size={22} /></div><h2>Удалить проект?</h2><p>Это действие нельзя отменить. Карточка будет удалена из списка.</p><div className="confirm-actions"><button className="cancel" onClick={() => setDeletingId(null)}>Отмена</button><button className="danger" onClick={confirmDelete}>Удалить</button></div></section></div>}
    {toast && <div className="toast" role="status"><span><Icon name="check" size={15} /></span>{toast}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)

