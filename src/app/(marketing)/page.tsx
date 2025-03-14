'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-b from-teal-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-teal-600 to-blue-600">
            스마트한 의약품 분석 플랫폼
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto">
            AI 기반 의약품 분석으로 더 안전하고 효과적인 의약품 정보를 제공합니다
            실시간 데이터로 신뢰할 수 있는 분석 결과를 확인하세요
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={isAuthenticated ? "/dashboard" : "/login"}
              className="px-8 py-3 rounded-full bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
            >
              분석 시작하기
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 rounded-full border border-gray-300 dark:border-gray-600 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              의약품 데이터베이스
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            정확한 의약품 분석 서비스
          </h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="bg-teal-100 dark:bg-teal-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image
                  src="/images/pill4.jpg"
                  alt="AI Analysis"
                  width={32}
                  height={32}
                  className="w-8 h-8 dark:invert"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI 기반 분석</h3>
              <p className="text-gray-600 dark:text-gray-400">
                최신 AI 기술을 활용한 정확한 의약품 성분 분석
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image
                  src="/images/dbimages.jpg"
                  alt="Database"
                  width={32}
                  height={32}
                  className="w-8 h-8 dark:invert"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4">방대한 데이터베이스</h3>
              <p className="text-gray-600 dark:text-gray-400">
                국내외 의약품 정보를 포함한 종합적인 데이터베이스
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cyan-100 dark:bg-cyan-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Image
                  src="/images/dna.jpg"
                  alt="Reports"
                  width={32}
                  height={32}
                  className="w-8 h-8 dark:invert"
                />
              </div>
              <h3 className="text-xl font-semibold mb-4">상세 분석 리포트</h3>
              <p className="text-gray-600 dark:text-gray-400">
                전문적이고 이해하기 쉬운 분석 보고서 제공
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Analysis Examples Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">
            분석 사례 살펴보기
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((pill) => (
              <div key={pill} className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video relative bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={`/images/pill${pill}.jpg`}
                    alt={`Analysis Example ${pill}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    {pill === 1 ? 'BT 각인 원형 흰색 알약 분석' : 
                     pill === 2 ? 'TYLENOL 각인 타원형 흰색 알약 분석' : 
                     'GD 각인 마름모형 분홍색 알약 분석'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    실제 의약품 분석 결과를 확인해보세요
                  </p>
                  <Link
                    href={`/examples/${pill}`}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    자세히 보기 →
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/examples"
              className="px-6 py-3 rounded-full border border-teal-600 text-teal-600 font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors inline-block"
            >
              모든 분석 사례 보기
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-teal-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-8">
            지금 바로 의약품을 분석해보세요
          </h2>
          <p className="text-xl mb-12 max-w-2xl mx-auto opacity-90">
            첫 분석은 무료로 제공됩니다
          </p>
          <Link
            href="/pricing"
            className="px-8 py-3 rounded-full bg-white text-teal-600 font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            무료 분석 시작하기
          </Link>
        </div>
      </section>
    </div>
  );
}
