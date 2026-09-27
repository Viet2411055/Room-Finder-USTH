import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CreateListingPage } from './CreateListingPage';
import { api } from '../../services/api';

vi.mock('../../services/api', () => ({
  api: { createListing: vi.fn() },
  ApiError: class ApiError extends Error {},
}));

describe('CreateListingPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('submits only once while listing creation is pending', async () => {
    const user = userEvent.setup();
    let resolveRequest!: (value: { id: string }) => void;
    vi.mocked(api.createListing).mockReturnValue(new Promise(resolve => { resolveRequest = resolve; }) as never);

    render(<MemoryRouter><CreateListingPage /></MemoryRouter>);

    await user.type(screen.getByPlaceholderText(/Căn hộ Studio/), 'Căn hộ chống double submit');
    await user.click(screen.getByRole('button', { name: /Tiếp tục/ }));
    await user.type(screen.getByPlaceholderText(/Số 88/), '88 Võ Nguyên Giáp');
    await user.click(screen.getByRole('button', { name: /Tiếp tục/ }));
    await user.click(screen.getByRole('button', { name: /Tiếp tục/ }));
    await user.type(screen.getByPlaceholderText('https://example.com/anh-1.jpg'), 'https://example.com/room.jpg');
    await user.click(screen.getByRole('button', { name: /Tiếp tục/ }));
    await user.click(screen.getByRole('button', { name: /Tiếp tục/ }));
    await user.type(screen.getByPlaceholderText(/Mô tả không gian/), 'Một căn phòng đầy đủ tiện nghi và gần trung tâm thành phố.');
    await user.click(screen.getByRole('button', { name: /Tiếp tục/ }));

    const publish = screen.getByRole('button', { name: /Xuất bản phòng ngay/ });
    fireEvent.click(publish);
    fireEvent.click(publish);

    expect(api.createListing).toHaveBeenCalledTimes(1);
    expect((screen.getByRole('button', { name: /Đang tạo phòng/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Đang hoàn tất phòng của bạn/)).not.toBeNull();

    resolveRequest({ id: 'listing-1' });
  });
});
