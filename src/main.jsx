import { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const CATEGORIES = ['灵感', '设计', 'AI工具', '学习', '娱乐']
const SEA_COLORS = {
  灵感: { body: 'from-cyan-200 to-sky-300', fin: 'bg-cyan-100/80', deco: '✨' },
  设计: { body: 'from-indigo-200 to-violet-300', fin: 'bg-indigo-100/80', deco: '◌' },
  AI工具: { body: 'from-emerald-200 to-teal-300', fin: 'bg-emerald-100/80', deco: '⬡' },
  学习: { body: 'from-amber-100 to-orange-200', fin: 'bg-amber-50/80', deco: '✦' },
  娱乐: { body: 'from-pink-200 to-rose-300', fin: 'bg-pink-100/80', deco: '♪' },
}

const seedData = [
  { title: 'Awwwards', url: 'https://www.awwwards.com', category: '灵感', tags: ['灵感', '网页'], note: '找高级视觉灵感' },
  { title: 'Figma', url: 'https://www.figma.com', category: '设计', tags: ['UI', '协作'], note: '常用设计工作台' },
  { title: 'Hugging Face', url: 'https://huggingface.co', category: 'AI工具', tags: ['模型', 'AI'], note: '模型与数据集' },
  { title: 'Coursera', url: 'https://www.coursera.org', category: '学习', tags: ['课程'], note: '系统学习课程' },
  { title: 'Bilibili', url: 'https://www.bilibili.com', category: '娱乐', tags: ['视频'], note: '放松一下' },
]

const random = (min, max) => Math.random() * (max - min) + min

const createFish = (item, i = 0) => ({
  id: crypto.randomUUID(),
  ...item,
  x: random(8, 86),
  y: random(12, 82),
  vx: random(0.08, 0.2) * (Math.random() > 0.5 ? 1 : -1),
  vy: random(-0.05, 0.05),
  drift: random(0.8, 2.2),
  driftOffset: i * 0.9,
  size: random(64, 104),
})

function App() {
  const [fishList, setFishList] = useState(() => seedData.map(createFish))
  const [categoryFilter, setCategoryFilter] = useState('全部')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [hoveredId, setHoveredId] = useState(null)
  const [viewMode, setViewMode] = useState('ocean')
  const [isNight, setIsNight] = useState(false)
  const [feedCategory, setFeedCategory] = useState('')
  const [organizing, setOrganizing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', url: '', category: '灵感', tags: '', note: '' })

  const rafRef = useRef(0)
  const frameRef = useRef(0)

  const filteredFish = useMemo(() => {
    return fishList.filter((f) => {
      const categoryOk = categoryFilter === '全部' || f.category === categoryFilter
      const q = query.toLowerCase().trim()
      const queryOk =
        !q ||
        f.title.toLowerCase().includes(q) ||
        f.url.toLowerCase().includes(q) ||
        f.tags.join(' ').toLowerCase().includes(q)
      return categoryOk && queryOk
    })
  }, [fishList, categoryFilter, query])

  // 核心动画循环：使用 requestAnimationFrame 让鱼有连续、轻柔的游动感。
  useEffect(() => {
    const loop = () => {
      frameRef.current += 1
      const t = frameRef.current
      setFishList((prev) =>
        prev.map((f) => {
          const slowed = hoveredId === f.id ? 0.25 : 1
          const nx = f.x + f.vx * slowed
          const ny = f.y + f.vy * slowed + Math.sin(t * 0.025 + f.driftOffset) * 0.02 * f.drift
          let vx = f.vx
          let vy = f.vy
          let x = nx
          let y = ny

          if (!feedCategory && categoryFilter === '全部') {
            if (x < 3 || x > 92) vx = -vx
            if (y < 10 || y > 88) vy = -vy
            x = Math.min(94, Math.max(2, x))
            y = Math.min(90, Math.max(8, y))
          }

          if (feedCategory && f.category === feedCategory) {
            const tx = 50 + Math.sin(t * 0.03 + f.driftOffset) * 12
            const ty = 52 + Math.cos(t * 0.035 + f.driftOffset) * 9
            x += (tx - x) * 0.04
            y += (ty - y) * 0.04
          }

          if (categoryFilter !== '全部' && f.category === categoryFilter) {
            const idx = filteredFish.findIndex((it) => it.id === f.id)
            const cols = 4
            const col = idx % cols
            const row = Math.floor(idx / cols)
            const tx = 18 + col * 18
            const ty = 26 + row * 16
            x += (tx - x) * 0.06
            y += (ty - y) * 0.06
          }

          return { ...f, x, y, vx, vy }
        }),
      )
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [categoryFilter, feedCategory, hoveredId, filteredFish])

  const triggerOrganizing = () => {
    setOrganizing(true)
    window.setTimeout(() => setOrganizing(false), 700)
  }

  const addFish = (e) => {
    e.preventDefault()
    if (!form.title || !form.url) return
    const newFish = createFish({
      title: form.title,
      url: form.url,
      category: form.category,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      note: form.note,
    })
    setFishList((prev) => [newFish, ...prev])
    setShowForm(false)
    setForm({ title: '', url: '', category: '灵感', tags: '', note: '' })
  }

  return (
    <div className={`min-h-screen ${isNight ? 'bg-slate-950' : 'bg-cyan-50'} transition-colors duration-700`}>
      <div className="mx-auto max-w-7xl px-6 py-7">
        <header className="mb-5 rounded-3xl border border-white/40 bg-white/55 p-5 shadow-glow backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">海洋收藏夹小游戏</h1>
              <p className="text-sm text-slate-500">每个网址都是一条会呼吸、会游动的小鱼。</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setIsNight((v) => !v)} className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white">
                {isNight ? '切换白天' : '切换夜晚'}
              </button>
              <button onClick={() => setShowForm(true)} className="rounded-full bg-cyan-500 px-4 py-2 text-sm text-white">添加网址</button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {['全部', ...CATEGORIES].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setCategoryFilter(c)
                  triggerOrganizing()
                }}
                className={`rounded-full px-3 py-1.5 text-sm ${categoryFilter === c ? 'bg-cyan-500 text-white' : 'bg-white/70 text-slate-700'}`}
              >
                {c}
              </button>
            ))}
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索标题 / 标签 / 链接"
              className="ml-auto min-w-56 rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm outline-none"
            />
            <select value={feedCategory} onChange={(e) => setFeedCategory(e.target.value)} className="rounded-full bg-white/70 px-3 py-2 text-sm">
              <option value="">投喂模式（关闭）</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>投喂 {c}</option>
              ))}
            </select>
            <button
              onClick={() => {
                setViewMode((v) => (v === 'ocean' ? 'list' : 'ocean'))
                triggerOrganizing()
              }}
              className="rounded-full bg-slate-100 px-3 py-2 text-sm text-slate-700"
            >
              {viewMode === 'ocean' ? '列表管理视图' : '海洋游动视图'}
            </button>
          </div>
        </header>

        <main className="relative overflow-hidden rounded-3xl border border-white/30 bg-gradient-to-b from-sky-300/35 via-cyan-200/30 to-blue-300/25 p-5 shadow-glow backdrop-blur-md">
          {organizing && (
            <div className="absolute inset-0 z-30 grid place-items-center bg-slate-900/35 text-white backdrop-blur-sm">
              <p className="rounded-full bg-white/20 px-4 py-2 text-sm">鱼缸整理中...</p>
            </div>
          )}

          {viewMode === 'ocean' ? (
            <div className="relative h-[70vh] min-h-[520px] w-full overflow-hidden rounded-2xl">
              <div className={`absolute inset-0 ${isNight ? 'bg-gradient-to-b from-slate-900/80 to-blue-950/80' : 'bg-gradient-to-b from-cyan-200/30 to-sky-300/50'} transition-all`} />
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={`bubble-${i}`}
                  className="absolute bottom-[-50px] h-2 w-2 animate-bubbleRise rounded-full bg-white/60"
                  style={{ left: `${(i * 7 + 9) % 96}%`, animationDelay: `${(i % 9) * 0.9}s`, animationDuration: `${8 + (i % 6)}s` }}
                />
              ))}

              {filteredFish.map((fish) => {
                const theme = SEA_COLORS[fish.category]
                const facing = fish.vx >= 0 ? 1 : -1
                return (
                  <button
                    key={fish.id}
                    onMouseEnter={() => setHoveredId(fish.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelected(fish)}
                    className="absolute z-10 border-none bg-transparent p-0 text-left transition-transform"
                    style={{
                      left: `${fish.x}%`,
                      top: `${fish.y}%`,
                      transform: `translate(-50%, -50%) scale(${hoveredId === fish.id ? 1.08 : 1})`,
                    }}
                  >
                    <div className="relative">
                      <div
                        className={`relative flex items-center rounded-full border border-white/50 bg-gradient-to-br ${theme.body} px-4 py-2 shadow-xl backdrop-blur-md`}
                        style={{ width: `${fish.size}px`, transform: `scaleX(${facing})` }}
                      >
                        <span className={`mr-2 h-5 w-5 rounded-full ${theme.fin}`} />
                        <span className="line-clamp-1 text-xs font-medium text-slate-700">{fish.title}</span>
                        <span className="ml-2 text-xs">{theme.deco}</span>
                      </div>
                      <span className="absolute left-2 top-1 h-1.5 w-1.5 rounded-full bg-slate-800/70" />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {filteredFish.map((fish) => (
                <article key={fish.id} className="rounded-2xl border border-white/50 bg-white/55 p-4 backdrop-blur-md">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="font-medium text-slate-700">{fish.title}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{fish.category}</span>
                  </div>
                  <a href={fish.url} target="_blank" rel="noreferrer" className="text-sm text-cyan-700 underline">
                    {fish.url}
                  </a>
                  <p className="mt-2 text-xs text-slate-500">标签：{fish.tags.join(' / ') || '无'}</p>
                  <p className="mt-1 text-xs text-slate-500">备注：{fish.note || '暂无备注'}</p>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/30 p-5 text-slate-800 shadow-2xl backdrop-blur-2xl">
            <h2 className="text-xl font-semibold">{selected.title}</h2>
            <p className="mt-2 text-sm">分类：{selected.category}</p>
            <a href={selected.url} target="_blank" rel="noreferrer" className="mt-2 block text-sm text-cyan-800 underline">
              {selected.url}
            </a>
            <p className="mt-2 text-sm">标签：{selected.tags.join(' / ') || '无'}</p>
            <p className="mt-2 text-sm">备注：{selected.note || '暂无备注'}</p>
            <button onClick={() => setSelected(null)} className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-sm text-white">关闭</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4">
          <form onSubmit={addFish} className="w-full max-w-lg space-y-3 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-semibold text-slate-700">添加一条“小鱼网址”</h2>
            <input value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} placeholder="标题" className="w-full rounded-xl border p-2" required />
            <input value={form.url} onChange={(e) => setForm((s) => ({ ...s, url: e.target.value }))} placeholder="链接 https://" className="w-full rounded-xl border p-2" required />
            <select value={form.category} onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))} className="w-full rounded-xl border p-2">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input value={form.tags} onChange={(e) => setForm((s) => ({ ...s, tags: e.target.value }))} placeholder="标签（逗号分隔）" className="w-full rounded-xl border p-2" />
            <textarea value={form.note} onChange={(e) => setForm((s) => ({ ...s, note: e.target.value }))} placeholder="备注" className="w-full rounded-xl border p-2" rows={3} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full bg-slate-200 px-4 py-2 text-sm">取消</button>
              <button type="submit" className="rounded-full bg-cyan-500 px-4 py-2 text-sm text-white">保存为小鱼</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
