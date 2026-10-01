import { Link } from 'react-router-dom'

function StaffCard({ version, isHod }) {
  return (
    <Link
      to={`/staff/${version.staff_profile_id}`}
      className="block bg-white border border-funato-brown-light rounded-lg p-4 hover:shadow-md hover:border-funato-brown transition"
    >
      <div className="flex items-center gap-4">
        {version.photo_url ? (
          <img src={version.photo_url} alt={version.full_name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-funato-brown-light" />
        )}
        <div>
          <h3 className="text-funato-brown font-semibold">{version.full_name}</h3>
          {isHod && (
            <span className="inline-block text-xs bg-funato-brown text-funato-cream px-2 py-0.5 rounded-full mt-1">
              Head of Department
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default StaffCard