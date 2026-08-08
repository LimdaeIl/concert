import {
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  type SubmitEvent,
  useState,
} from 'react';

interface PaymentCancelDialogProps {
  open: boolean;
  submitting: boolean;
  onClose: () => void;
  onConfirm: (
      reason: string,
  ) => Promise<void>;
}

export default function PaymentCancelDialog({
                                              open,
                                              submitting,
                                              onClose,
                                              onConfirm,
                                            }: PaymentCancelDialogProps) {
  const [reason, setReason] =
      useState('');

  if (!open) {
    return null;
  }

  async function handleSubmit(
      event: SubmitEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!reason.trim()) {
      return;
    }

    await onConfirm(
        reason.trim(),
    );
  }

  return (
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 sm:items-center">
        <div className="w-full max-w-[640px] rounded-t-3xl bg-white p-5 sm:mx-4 sm:rounded-3xl">
          <div className="flex items-start justify-between">
            <div className="flex size-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle
                  size={23}
              />
            </div>

            <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                aria-label="닫기"
            >
              <X size={21} />
            </button>
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-950">
            예매를 취소하시겠습니까?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            결제가 전체 취소되고 예약한 좌석은
            다시 예매 가능한 상태로 변경됩니다.
          </p>

          <form
              onSubmit={handleSubmit}
              className="mt-6"
          >
            <label
                htmlFor="cancelReason"
                className="text-sm font-medium text-slate-700"
            >
              취소 사유
            </label>

            <textarea
                id="cancelReason"
                value={reason}
                onChange={(event) =>
                    setReason(
                        event.target.value,
                    )
                }
                rows={4}
                maxLength={200}
                placeholder="취소 사유를 입력해주세요."
                className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-400 focus:ring-4 focus:ring-red-50"
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {reason.length}/200
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="h-12 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
              >
                돌아가기
              </button>

              <button
                  type="submit"
                  disabled={
                      submitting ||
                      !reason.trim()
                  }
                  className="h-12 rounded-xl bg-red-600 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting
                    ? '취소 처리 중...'
                    : '예매 취소'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}
