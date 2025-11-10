import { useEffect, useMemo, useState } from 'react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function CourseCard({ course, onOpen }) {
  return (
    <div className="group bg-white/70 backdrop-blur border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => onOpen(course)}>
      <div className="flex items-start gap-4">
        <img src={course.cover_image || `https://picsum.photos/seed/${course.id}/160/100`} alt="cover" className="w-32 h-20 object-cover rounded-md" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{course.title}</h3>
            {course.level && <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100">{course.level}</span>}
          </div>
          <p className="text-gray-600 mt-1 line-clamp-2">{course.description}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {(course.tags || []).map(t => (
              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Header({ onCreate }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Modern LMS</h1>
        <p className="text-gray-600">Создавайте курсы, проходите уроки и отслеживайте прогресс</p>
      </div>
      <button onClick={onCreate} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow">
        <span>Новый курс</span>
      </button>
    </div>
  )
}

function CreateCourseModal({ open, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [level, setLevel] = useState('beginner')

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold">Создать курс</h3>
        <div className="mt-4 space-y-3">
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Название" value={title} onChange={e=>setTitle(e.target.value)} />
          <textarea className="w-full border rounded-lg px-3 py-2" rows={4} placeholder="Описание" value={description} onChange={e=>setDescription(e.target.value)} />
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Теги (через запятую)" value={tags} onChange={e=>setTags(e.target.value)} />
          <select className="w-full border rounded-lg px-3 py-2" value={level} onChange={e=>setLevel(e.target.value)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Отмена</button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 text-white" onClick={() => {
            onSubmit({ title, description, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), level })
            onClose()
          }}>Создать</button>
        </div>
      </div>
    </div>
  )
}

function CourseDetail({ course, onBack }) {
  const [lessons, setLessons] = useState([])
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    if (!course) return
    fetch(`${BACKEND}/api/courses/${course.id}/lessons`).then(r=>r.json()).then(setLessons)
    fetch(`${BACKEND}/api/courses/${course.id}/assignments`).then(r=>r.json()).then(setAssignments)
  }, [course])

  return (
    <div className="space-y-6">
      <button className="text-blue-600" onClick={onBack}>← Назад к курсам</button>
      <div className="bg-white rounded-xl p-6 border shadow-sm">
        <div className="flex items-start gap-4">
          <img src={course.cover_image || `https://picsum.photos/seed/${course.id}/240/140`} className="w-60 h-36 object-cover rounded-lg" />
          <div>
            <h2 className="text-2xl font-bold">{course.title}</h2>
            <p className="text-gray-600 mt-2 max-w-2xl">{course.description}</p>
            <div className="mt-3 flex gap-2 flex-wrap">
              {(course.tags||[]).map(t => <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">#{t}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold mb-3">Уроки</h3>
          <ul className="space-y-2">
            {lessons.map(l => (
              <li key={l.id} className="p-3 border rounded-lg flex items-center justify-between">
                <span>{l.order}. {l.title}</span>
                <a href={l.video_url || '#'} className="text-blue-600 text-sm" target="_blank">Видео</a>
              </li>
            ))}
            {lessons.length === 0 && <p className="text-gray-500">Пока нет уроков</p>}
          </ul>
        </div>
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="font-semibold mb-3">Задания</h3>
          <ul className="space-y-2">
            {assignments.map(a => (
              <li key={a.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{a.title}</span>
                  {a.due_date && <span className="text-xs text-gray-500">до {new Date(a.due_date).toLocaleDateString()}</span>}
                </div>
                <p className="text-gray-600 text-sm">{a.description}</p>
              </li>
            ))}
            {assignments.length === 0 && <p className="text-gray-500">Пока нет заданий</p>}
          </ul>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [courses, setCourses] = useState([])
  const [query, setQuery] = useState('')
  const [openCreate, setOpenCreate] = useState(false)
  const [activeCourse, setActiveCourse] = useState(null)

  const filtered = useMemo(() => {
    if (!query) return courses
    return courses.filter(c => c.title.toLowerCase().includes(query.toLowerCase()))
  }, [courses, query])

  useEffect(() => {
    fetch(`${BACKEND}/api/courses`).then(r=>r.json()).then(setCourses)
  }, [])

  const createCourse = async (payload) => {
    const res = await fetch(`${BACKEND}/api/courses`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, instructor_id: 'demo-user' }) })
    const data = await res.json()
    setCourses(prev => [data, ...prev])
  }

  if (activeCourse) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <CourseDetail course={activeCourse} onBack={() => setActiveCourse(null)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <Header onCreate={() => setOpenCreate(true)} />

        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <input value={query} onChange={e=>setQuery(e.target.value)} className="w-full border rounded-xl px-4 py-3 pl-10 bg-white/70 backdrop-blur" placeholder="Поиск курсов" />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔎</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} onOpen={setActiveCourse} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center text-gray-500">Курсы не найдены</div>
          )}
        </div>
      </div>

      <CreateCourseModal open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={createCourse} />
    </div>
  )
}

export default App
