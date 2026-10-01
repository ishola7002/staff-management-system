import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient.js'
import { useIsAdmin } from '../../hooks/useIsAdmin.js'

function NewsManagement() {
  const navigate = useNavigate()
  const { isAdmin, adminRecord, loading: adminLoading } = useIsAdmin()
  const [newsList, setNewsList] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [posting, setPosting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (adminLoading) return
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    loadNews()
  }, [isAdmin, adminLoading, navigate])

  async function loadNews() {
    setLoading(true)
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
    setNewsList(data || [])
    setLoading(false)
  }

  async function handlePost(e) {
    e.preventDefault()
    setError(null)
    if (!title.trim() || !content.trim()) return
    setPosting(true)

    let imageUrl = null
    if (imageFile) {
      const filePath = `news-${Date.now()}.${imageFile.name.split('.').pop()}`
      const { error: uploadError } = await supabase.storage
        .from('news-images')
        .upload(filePath, imageFile)

      if (uploadError) {
        setError(uploadError.message)
        setPosting(false)
        return
      }
      const { data: urlData } = supabase.storage.from('news-images').getPublicUrl(filePath)
      imageUrl = urlData.publicUrl
    }

    const { error } = await supabase.from('news').insert({
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl,
      posted_by: adminRecord.id,
    })

    if (error) {
      setError(error.message)
    } else {
      setTitle('')
      setContent('')
      setImageFile(null)
      loadNews()
    }
    setPosting(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this news item?')) return
    const { error } = await supabase.from('news').delete().eq('id', id)
    if (error) {
      setError(error.message)
    } else {
      loadNews()
    }
  }

  if (adminLoading || loading) return <p className="text-funato-brown-dark">Loading…</p>

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-funato-brown text-2xl font-bold mb-6">News</h1>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <form onSubmit={handlePost} className="bg-white border border-funato-brown-light rounded-lg p-5 mb-8 space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Headline"
          className="w-full border border-funato-brown-light rounded-md px-3 py-2"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Details"
          rows={4}
          className="w-full border border-funato-brown-light rounded-md px-3 py-2"
        />
        <div>
          <label className="block text-sm text-funato-brown-dark mb-1">Image (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={posting}
          className="bg-funato-brown text-funato-cream font-medium px-4 py-2 rounded-md hover:bg-funato-brown-dark transition disabled:opacity-50"
        >
          {posting ? 'Posting…' : 'Post'}
        </button>
      </form>

      <div className="space-y-3">
        {newsList.map((item) => (
          <div key={item.id} className="bg-white border border-funato-brown-light rounded-lg p-4">
            {item.image_url && (
              <img src={item.image_url} alt="" className="w-full h-40 object-cover rounded-md mb-3" />
            )}
            <div className="flex justify-between items-start">
              <h3 className="text-funato-brown font-semibold">{item.title}</h3>
              <button onClick={() => handleDelete(item.id)} className="text-red-600 text-sm hover:underline">
                Delete
              </button>
            </div>
            <p className="text-sm text-funato-brown-dark mt-1">{item.content}</p>
            <p className="text-xs text-funato-brown-light mt-2">
              {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsManagement