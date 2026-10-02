import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient.js'
import { useColleges } from '../hooks/useColleges.js'

function StaffBrowseMenu() {
  const { colleges } = useColleges()
  const [units, setUnits] = useState([])
  const [open, setOpen] = useState(false)
  const [openType, setOpenType] = useState(null)
  const [openCollegeId, setOpenCollegeId] = useState(null)
  const [departmentsByCollege, setDepartmentsByCollege] = useState({})
  const menuRef = useRef(null)

  useEffect(() => {
    async function loadUnits() {
      const { data } = await supabase.from('units').select('*').order('name')
      setUnits(data || [])
    }
    loadUnits()
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeAll()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  async function ensureDepartments(collegeId) {
    if (departmentsByCollege[collegeId]) return
    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('college_id', collegeId)
      .order('name')
    setDepartmentsByCollege((prev) => ({ ...prev, [collegeId]: data || [] }))
  }

  function closeAll() {
    setOpen(false)
    setOpenType(null)
    setOpenCollegeId(null)
  }

  function toggleType(type) {
    setOpenType((prev) => (prev === type ? null : type))
    setOpenCollegeId(null)
  }

  function toggleCollege(collegeId) {
    setOpenCollegeId((prev) => (prev === collegeId ? null : collegeId))
    ensureDepartments(collegeId)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="hover:text-funato-brown-light text-sm font-medium"
      >
        Units
      </button>

      {open && (
        <div className="fixed top-16 left-0 right-0 sm:absolute sm:top-full sm:left-0 sm:right-auto bg-white border border-funato-brown-light rounded-md shadow-lg w-screen sm:w-80 mx-0 sm:mx-0 z-50 text-funato-brown-dark max-h-[calc(100vh-64px)] overflow-y-auto">
          {/* Teaching row */}
          <div>
            <button
              onClick={() => toggleType('teaching')}
              className="w-full text-left px-4 py-2.5 hover:bg-funato-cream flex justify-between items-center text-sm"
            >
              Teaching Staff <span>{openType === 'teaching' ? '⌄' : '›'}</span>
            </button>
            {openType === 'teaching' && (
              <div className="bg-funato-cream">
                {colleges.map((c) => (
                  <div key={c.id}>
                    <button
                      onClick={() => toggleCollege(c.id)}
                      className="w-full text-left px-5 py-2 hover:bg-white flex justify-between items-center text-sm break-words"
                    >
                      <span className="flex-1">{c.name}</span> <span className="flex-shrink-0 ml-2">{openCollegeId === c.id ? '⌄' : '›'}</span>
                    </button>
                    {openCollegeId === c.id && (
                      <div className="bg-white">
                        {(departmentsByCollege[c.id] || []).map((d) => (
                          <Link
                            key={d.id}
                            to={`/departments/${d.id}`}
                            onClick={closeAll}
                            className="block px-7 py-2 hover:bg-funato-cream text-sm break-words"
                          >
                            {d.name}
                          </Link>
                        ))}
                        {!departmentsByCollege[c.id] && (
                          <div className="px-7 py-2 text-xs text-funato-brown-light">Loading…</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Non-Teaching row */}
          <div className="border-t border-funato-brown-light">
            <button
              onClick={() => toggleType('non_teaching')}
              className="w-full text-left px-4 py-2.5 hover:bg-funato-cream flex justify-between items-center text-sm"
            >
              Non-Teaching Staff <span>{openType === 'non_teaching' ? '⌄' : '›'}</span>
            </button>
            {openType === 'non_teaching' && (
              <div className="bg-funato-cream">
                {units.map((u) => (
                  <Link
                    key={u.id}
                    to={`/units/${u.id}`}
                    onClick={closeAll}
                    className="block px-5 py-2 hover:bg-white text-sm"
                  >
                    {u.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffBrowseMenu