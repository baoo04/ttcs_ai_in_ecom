"use client";

import React from "react";

type InventoryItem = {
  id: number;
  product_name: string; 
  initial_stock: number; 
  delay_days: number; 
  remaining_quantity: number; 
  replenish_date: string; 
  prediction: string; 
};

export default function InventoryTable({ data }: { data: InventoryItem[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                Tên Sản Phẩm
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                Tồn Đầu Hàng
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                Số ngày delay
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                Số Lượng Còn Nhiều
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                Thời Gian Cần Nhập
              </th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 border-b">
                Dự Đoán Hướng Khác Hàng
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                  <div className="line-clamp-2">{item.product_name}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {item.initial_stock}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {item.delay_days}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {item.remaining_quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {item.replenish_date}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center max-w-xs">
                  <div className="line-clamp-2">{item.prediction}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
