import { Copy, ExternalLink, MoreHorizontal, Pencil, Trash2, Video } from "lucide-react";
import { Link } from "react-router-dom";

function EventTypeCard({ eventType, onEdit, onDelete }) {
  const publicUrl = `${window.location.origin}/book/${eventType.slug}`;
  const accentColors = ["bg-[#8247f5]", "bg-[#006bff]", "bg-[#00a36c]", "bg-[#ff8a00]"];
  const accent = accentColors[eventType.id % accentColors.length];

  async function copyLink() {
    await navigator.clipboard.writeText(publicUrl);
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-[#e5e7eb] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
      <div className="flex">
        <div className={`w-1.5 shrink-0 ${accent}`} />

        <div className="min-w-0 flex-1 p-4">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-base font-semibold text-slate-950">{eventType.name}</h3>
                <span className="rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700">
                  Active
                </span>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-[#64748b]">
                {eventType.description || "One-on-one scheduling event"}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#64748b]">
                <span>{eventType.duration_minutes} min</span>
                <span>-</span>
                <span className="inline-flex items-center gap-1">
                  <Video size={14} />
                  Google Meet
                </span>
                <span>-</span>
                <span>One-on-One</span>
              </div>

              <p className="mt-2 text-sm text-[#64748b]">{eventType.availability_summary || "Configured availability"}</p>
              <p className="mt-2 truncate text-xs font-semibold text-brand-blue">/book/{eventType.slug}</p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
              <button className="btn-secondary" type="button" onClick={copyLink}>
                <Copy size={15} />
                Copy Link
              </button>
              <Link className="btn-secondary" to={`/book/${eventType.slug}`}>
                <ExternalLink size={15} />
                Open
              </Link>
              <button className="btn-secondary px-2.5" type="button">
                <MoreHorizontal size={17} />
              </button>
            </div>
          </div>

          {(onEdit || onDelete) ? (
            <div className="mt-4 flex items-center gap-2 border-t border-[#e5e7eb] pt-3">
              {onEdit ? (
                <button className="btn-secondary" type="button" onClick={() => onEdit(eventType)}>
                  <Pencil size={15} />
                  Edit
                </button>
              ) : null}
              {onDelete ? (
                <button className="btn-danger" type="button" onClick={() => onDelete(eventType.id)}>
                  <Trash2 size={15} />
                  Delete
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default EventTypeCard;
