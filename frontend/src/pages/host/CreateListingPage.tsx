import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Check, LoaderCircle } from 'lucide-react';
import { api, ApiError } from '../../services/api';

export const CreateListingPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState('');
  const [roomType, setRoomType] = useState('Toàn bộ căn hộ');
  const [guests, setGuests] = useState(2);
  const [bedrooms, setBedrooms] = useState(1);
  const [beds, setBeds] = useState(1);
  const [baths, setBaths] = useState(1);

  const [city, setCity] = useState('Đà Nẵng');
  const [district, setDistrict] = useState('Quận Sơn Trà');
  const [address, setAddress] = useState('');

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Wi-fi',
    'Điều hòa nhiệt độ',
    'Nhà bếp',
    'Tự nhận phòng',
  ]);

  const [images, setImages] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState('');

  const [pricePerNight, setPricePerNight] = useState(850000);
  const [cleaningFee, setCleaningFee] = useState(120000);
  const [description, setDescription] = useState('');

  const amenityOptions = [
    'Wi-fi',
    'Điều hòa nhiệt độ',
    'Nhà bếp',
    'Máy giặt',
    'TV',
    'Tự nhận phòng',
    'Chỗ đỗ xe miễn phí trong khuôn viên',
    'Hồ bơi',
    'Ban công',
    'Bàn ủi',
    'Máy sấy tóc',
  ];

  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const publishInFlightRef = useRef(false);

  const handlePublish = async () => {
    if (publishInFlightRef.current) return;
    if (!name.trim() || description.trim().length < 20 || !address.trim() || images.length === 0) {
      setError('Vui lòng nhập tên, địa chỉ, mô tả tối thiểu 20 ký tự và ít nhất một URL ảnh hợp lệ.');
      return;
    }
    publishInFlightRef.current = true;
    setIsPublishing(true);
    setError('');
    const coordinates: Record<string, [number, number]> = { 'Hà Nội': [21.0285, 105.8542], 'Đà Nẵng': [16.0544, 108.2022], 'Hồ Chí Minh': [10.7769, 106.7009] };
    try {
      const newListing = await api.createListing({
      name: name.trim(),
      roomType,
      city,
      district,
      address: address.trim(),
      latitude: coordinates[city]?.[0] ?? 0,
      longitude: coordinates[city]?.[1] ?? 0,
      guestsMax: guests,
      bedrooms,
      beds,
      baths,
      amenities: selectedAmenities,
      images,
      pricePerNight,
      cleaningFee,
      serviceFeeRate: 0.08,
      description: description.trim(),
      houseRules: [],
      cancellationPolicyTitle: 'Chính sách hủy phòng',
      cancellationPolicyDescription: 'Điều kiện hoàn tiền được áp dụng theo thời điểm hủy và ngày nhận phòng.',
      status: 'ACTIVE',
      });
      navigate(`/rooms/${newListing.id}`);
    } catch (value) {
      publishInFlightRef.current = false;
      setIsPublishing(false);
      setError(value instanceof ApiError ? value.message : 'Không thể tạo phòng');
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8" aria-busy={isPublishing}>
      {isPublishing && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-white/80 px-6 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center shadow-airbnb-modal">
            <LoaderCircle className="mx-auto h-10 w-10 animate-spin text-rausch" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-extrabold text-content-primary">Đang hoàn tất phòng của bạn</h2>
            <p className="mt-2 text-xs leading-relaxed text-content-secondary">Vui lòng giữ nguyên trang. RoomFinder đang lưu thông tin và hình ảnh.</p>
          </div>
        </div>
      )}
      {/* Top Header & Progress */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/host/listings'))}
          className="flex items-center gap-2 text-xs font-bold text-content-secondary hover:text-content-primary"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{step > 1 ? 'Bước trước' : 'Hủy đăng phòng'}</span>
        </button>

        <div className="text-xs font-bold text-content-secondary">
          Bước <span className="text-rausch font-black text-sm">{step}</span> / 7
        </div>
      </div>

      {/* Wizard Progress Bar */}
      <div className="w-full h-1.5 bg-border rounded-full overflow-hidden mb-8">
        <div
          className="h-full bg-rausch transition-all duration-300 rounded-full"
          style={{ width: `${(step / 7) * 100}%` }}
        />
      </div>

      {/* Step Content */}
      <div className="bg-white border border-border rounded-3xl p-6 sm:p-10 shadow-airbnb-card t-modal-content">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Thông tin cơ bản về phòng</h2>
              <p className="text-xs text-content-secondary mt-1">
                Đặt tên và chọn loại hình lưu trú phù hợp nhất với không gian của bạn
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">Tiêu đề phòng</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Căn hộ Studio view biển Mỹ Khê | Tự nhận phòng 24/7"
                className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">Loại chỗ ở</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value)}
                className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary font-medium cursor-pointer"
              >
                <option value="Toàn bộ căn hộ">Toàn bộ căn hộ</option>
                <option value="Phòng riêng trong nhà">Phòng riêng trong nhà</option>
                <option value="Biệt thự nguyên căn">Biệt thự nguyên căn</option>
                <option value="Homestay độc đáo">Homestay độc đáo</option>
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Số khách tối đa</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full border border-border rounded-xl p-2.5 text-sm font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Phòng ngủ</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full border border-border rounded-xl p-2.5 text-sm font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Số giường</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={beds}
                  onChange={(e) => setBeds(Number(e.target.value))}
                  className="w-full border border-border rounded-xl p-2.5 text-sm font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-content-secondary mb-1">Phòng tắm</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={baths}
                  onChange={(e) => setBaths(Number(e.target.value))}
                  className="w-full border border-border rounded-xl p-2.5 text-sm font-bold text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Location */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Vị trí căn phòng</h2>
              <p className="text-xs text-content-secondary mt-1">
                Giúp du khách dễ dàng tìm thấy địa chỉ nơi lưu trú của bạn
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-content-primary mb-1">Thành phố</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary font-medium"
                >
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-primary mb-1">Quận / Huyện</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="VD: Quận Sơn Trà / Quận 1 / Ba Đình"
                  className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">Địa chỉ chi tiết</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="VD: Số 88 Đường Võ Nguyên Giáp, Phường Phước Mỹ"
                className="w-full border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary"
              />
            </div>
          </div>
        )}

        {/* STEP 3: Amenities */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Tiện nghi có sẵn</h2>
              <p className="text-xs text-content-secondary mt-1">
                Chọn các tiện ích mà khách có thể sử dụng khi lưu trú tại phòng của bạn
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenityOptions.map((am) => {
                const isChecked = selectedAmenities.includes(am);
                return (
                  <button
                    key={am}
                    type="button"
                    onClick={() => {
                      if (isChecked) {
                        setSelectedAmenities(selectedAmenities.filter((a) => a !== am));
                      } else {
                        setSelectedAmenities([...selectedAmenities, am]);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition ${
                      isChecked
                        ? 'border-rausch bg-rausch/5 text-content-primary font-bold'
                        : 'border-border text-content-secondary hover:border-content-primary'
                    }`}
                  >
                    <span>{am}</span>
                    {isChecked && <Check className="w-4 h-4 text-rausch" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 4: Photos */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Hình ảnh căn phòng</h2>
              <p className="text-xs text-content-secondary mt-1">
                Dán mỗi URL ảnh trên một dòng. Ảnh đầu tiên sẽ là ảnh bìa.
              </p>
            </div>

            {/* Current Images Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden border border-border group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <span className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {idx === 0 ? 'Ảnh bìa' : `Ảnh ${idx + 1}`}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <textarea rows={5} value={imageUrls} onChange={event => { setImageUrls(event.target.value); setImages(event.target.value.split('\n').map(value => value.trim()).filter(value => /^https?:\/\//.test(value))); }} placeholder="https://example.com/anh-1.jpg" className="w-full border border-border rounded-xl p-3 text-xs" />
            </div>
          </div>
        )}

        {/* STEP 5: Pricing */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Thiết lập giá phòng</h2>
              <p className="text-xs text-content-secondary mt-1">
                Bạn luôn có thể thay đổi mức giá này bất cứ lúc nào trong bảng quản trị
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-primary mb-1">
                  Giá mỗi đêm (VND)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step={50000}
                    value={pricePerNight}
                    onChange={(e) => setPricePerNight(Number(e.target.value))}
                    className="w-full border border-border rounded-xl p-3.5 text-xl font-black text-content-primary focus:outline-none focus:ring-1 focus:ring-content-primary"
                  />
                  <span className="absolute right-4 top-4 font-bold text-xs text-content-secondary">
                    ₫ / đêm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-primary mb-1">
                  Phí vệ sinh (VND)
                </label>
                <input
                  type="number"
                  step={20000}
                  value={cleaningFee}
                  onChange={(e) => setCleaningFee(Number(e.target.value))}
                  className="w-full border border-border rounded-xl p-3 text-sm font-semibold"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Description & Rules */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Mô tả và Nội quy</h2>
              <p className="text-xs text-content-secondary mt-1">
                Đoạn văn giới thiệu nét cuốn hút của căn phòng cho du khách
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-content-primary mb-1">
                Đoạn văn mô tả
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả không gian, vị trí và trải nghiệm mà khách sẽ nhận được..."
                className="w-full border border-border rounded-xl p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-content-primary leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* STEP 7: Preview & Publish */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-extrabold text-content-primary">Kiểm tra và Xuất bản</h2>
              <p className="text-xs text-content-secondary mt-1">
                Xem lại các thông tin của căn phòng trước khi công khai lên RoomFinder
              </p>
            </div>

            <div className="border border-border rounded-2xl p-5 bg-surface-subtle/50 space-y-4">
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-subtle shrink-0 border border-border">
                  {images[0] ? <img src={images[0]} alt="" className="w-full h-full object-cover" /> : <span className="w-full h-full grid place-items-center text-xs text-content-secondary">Chưa có ảnh</span>}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-rausch uppercase tracking-wider">{roomType}</span>
                  <h3 className="font-extrabold text-base text-content-primary line-clamp-1">{name || 'Chưa đặt tên'}</h3>
                  <p className="text-xs text-content-secondary mt-0.5">{district}, {city}</p>
                  <p className="text-sm font-extrabold text-content-primary mt-2">
                    {pricePerNight.toLocaleString('vi-VN')} ₫ <span className="font-normal text-xs text-content-secondary">/ đêm</span>
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border-hairline text-xs text-content-secondary">
                <p>• Sức chứa: {guests} khách ({bedrooms} phòng ngủ, {beds} giường, {baths} phòng tắm)</p>
                <p>• {selectedAmenities.length} tiện nghi đã được chọn</p>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation Buttons */}
        <div className="mt-8 pt-6 border-t border-border-hairline flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-surface-subtle text-xs font-bold text-content-primary transition"
            >
              Quay lại
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-6 py-2.5 rounded-xl bg-content-primary hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-8 py-3 rounded-xl bg-rausch hover:bg-rausch-hover text-white text-xs font-bold transition shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 disabled:active:scale-100 flex items-center gap-2"
            >
              {isPublishing && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {isPublishing ? 'Đang tạo phòng…' : 'Xuất bản phòng ngay 🚀'}
            </button>
          )}
        </div>
        {error && <p className="mt-4 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  );
};
