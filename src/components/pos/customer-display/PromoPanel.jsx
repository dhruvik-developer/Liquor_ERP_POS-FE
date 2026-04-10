import { LoaderCircle } from 'lucide-react'
import { resolveMediaUrl } from '../../../utils/url'

const PromoBannerFallback = () => (
  <div className="relative h-full w-full overflow-hidden bg-[linear-gradient(125deg,#5c280d_0%,#8d4b22_35%,#cf8a4f_74%,#edbf83_100%)]">
    <div className="absolute inset-x-0 bottom-0 h-14 bg-[linear-gradient(180deg,rgba(32,16,7,0)_0%,rgba(32,16,7,0.22)_100%)]" />
    <div className="absolute right-6 top-5 h-24 w-16 rounded-[20px] bg-[linear-gradient(180deg,#d8b07b_0%,#a66c3d_100%)] opacity-90 shadow-[0_12px_25px_rgba(0,0,0,0.15)]" />
    <div className="absolute right-[114px] bottom-0 h-[78%] w-[50px] rounded-t-[20px] bg-[linear-gradient(180deg,#24170f_0%,#090909_85%)] shadow-[0_18px_32px_rgba(0,0,0,0.22)]" />
    <div className="absolute right-[174px] bottom-0 h-[74%] w-[44px] rounded-t-[18px] bg-[linear-gradient(180deg,#24170f_0%,#090909_85%)] shadow-[0_18px_32px_rgba(0,0,0,0.2)]" />
    <div className="absolute right-[228px] bottom-0 h-[71%] w-[46px] rounded-t-[18px] bg-[linear-gradient(180deg,#24170f_0%,#090909_85%)] shadow-[0_18px_32px_rgba(0,0,0,0.2)]" />
    <div className="absolute right-[288px] bottom-0 h-[73%] w-[44px] rounded-t-[18px] bg-[linear-gradient(180deg,#24170f_0%,#090909_85%)] shadow-[0_18px_32px_rgba(0,0,0,0.2)]" />
    <div className="absolute right-[342px] bottom-0 h-[70%] w-[42px] rounded-t-[18px] bg-[linear-gradient(180deg,#24170f_0%,#090909_85%)] shadow-[0_18px_32px_rgba(0,0,0,0.2)]" />
    <div className="absolute left-1/2 bottom-5 h-16 w-16 -translate-x-1/2 rounded-full border-[8px] border-[#6a2f15] bg-[rgba(243,226,210,0.18)] backdrop-blur-[1px]" />
    <div className="absolute left-1/2 bottom-10 h-16 w-[3px] -translate-x-1/2 bg-[#e7d6c0]" />
  </div>
)

const PromoPanel = ({
  promotion,
  isLoading = false,
  hasMultiplePromotions = false,
  activePromotionIndex = 0,
  promotionCount = 0,
}) => (
  <aside className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] max-[980px]:min-h-[360px]">
    <div className="overflow-hidden rounded-t-[12px]">
      <div className="h-[240px] bg-[#f2f4f7]">
        {promotion?.image ? (
          <img
            src={resolveMediaUrl(promotion.image)}
            alt={promotion.title || 'Promotion'}
            className="h-full w-full object-cover"
          />
        ) : isLoading ? (
          <div className="flex h-full items-center justify-center bg-[linear-gradient(125deg,#5c280d_0%,#8d4b22_35%,#cf8a4f_74%,#edbf83_100%)]">
            <LoaderCircle size={34} className="animate-spin text-white/85" />
          </div>
        ) : (
          <PromoBannerFallback />
        )}
      </div>
    </div>

    <div className="flex flex-1 flex-col items-center justify-start px-6 py-8 text-center">
      <h2 className="max-w-[320px] text-[20px] font-[800] leading-[1.2] tracking-[-0.03em] text-[#1f2937]">
        {promotion?.title || 'Get 15% Off All Local Wines'}
      </h2>
      <p className="mt-4 max-w-[340px] text-[16px] font-[500] leading-7 text-[#64748b]">
        {promotion?.description
          || promotion?.tagline
          || 'Discover the best of our region’s vineyards. Ask your cashier for recommendations!'}
      </p>

      {hasMultiplePromotions ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: promotionCount }).map((_, index) => (
            <span
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === activePromotionIndex ? 'w-8 bg-[#1d9bf0]' : 'w-2.5 bg-[#dbe3ee]'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  </aside>
)

export default PromoPanel
