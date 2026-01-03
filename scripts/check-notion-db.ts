/**
 * Notion 데이터베이스 구조 진단 스크립트
 * 실행: npx tsx scripts/check-notion-db.ts
 */

import { Client } from '@notionhq/client'
import * as dotenv from 'dotenv'

// .env.local 로드
dotenv.config({ path: '.env.local' })

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  notionVersion: '2025-09-03', // API v5
})

async function checkDatabase() {
  const databaseId = process.env.NOTION_DATABASE_ID

  if (!databaseId) {
    console.error('❌ NOTION_DATABASE_ID가 설정되지 않았습니다.')
    return
  }

  console.log('🔍 Notion 데이터베이스 확인 중...\n')
  console.log(`Database ID: ${databaseId}\n`)

  try {
    // 1. 데이터베이스 정보 조회
    const database = await notion.databases.retrieve({
      database_id: databaseId,
    })

    console.log('✅ 데이터베이스 연결 성공!\n')
    console.log(`📁 데이터베이스명: ${(database as any).title?.[0]?.plain_text || 'Unknown'}\n`)

    // 2. 속성 목록 출력
    console.log('📋 데이터베이스 속성 목록:')
    console.log('─'.repeat(50))

    const properties = (database as any).properties || {}
    if (Object.keys(properties).length === 0) {
      console.log('  ⚠️ 속성이 없습니다. (다른 구조일 수 있음)')
      console.log('  Raw database:', JSON.stringify(database, null, 2).slice(0, 1000))
    } else {
      for (const [name, prop] of Object.entries(properties)) {
        const propObj = prop as any
        console.log(`  • ${name} (${propObj.type})`)
      }
    }

    console.log('─'.repeat(50))
    console.log('')

    // 3. 기대 속성 vs 실제 속성 비교
    const expectedProps = ['견적서 번호', '클라이언트명', '발행일', '유효기간', '총 금액', '상태', '항목']
    const actualProps = Object.keys(properties)

    console.log('🔎 속성 비교:')
    for (const prop of expectedProps) {
      const exists = actualProps.includes(prop)
      console.log(`  ${exists ? '✅' : '❌'} ${prop}`)
    }

    console.log('')

    // 4. Data Source를 통한 샘플 데이터 조회
    console.log('📄 샘플 데이터 조회 (Data Source API):')
    console.log('─'.repeat(50))

    const dataSources = (database as any).data_sources
    if (dataSources && dataSources.length > 0) {
      const dataSourceId = dataSources[0].id
      console.log(`  Data Source ID: ${dataSourceId}\n`)

      try {
        const pages = await notion.dataSources.query({
          data_source_id: dataSourceId,
          page_size: 3,
        })

        if (pages.results.length === 0) {
          console.log('  ⚠️ 데이터베이스에 항목이 없습니다.')
        } else {
          for (const page of pages.results) {
            if ('properties' in page) {
              const props = page.properties as any
              console.log(`  • ID: ${page.id}`)
              console.log(`    속성들:`)
              for (const [key, value] of Object.entries(props)) {
                const v = value as any
                let displayValue = ''
                if (v.type === 'title') {
                  displayValue = v.title?.[0]?.plain_text || 'N/A'
                } else if (v.type === 'rich_text') {
                  displayValue = v.rich_text?.[0]?.plain_text || 'N/A'
                } else if (v.type === 'number') {
                  displayValue = v.number?.toString() || 'N/A'
                } else if (v.type === 'date') {
                  displayValue = v.date?.start || 'N/A'
                } else if (v.type === 'select') {
                  displayValue = v.select?.name || 'N/A'
                } else {
                  displayValue = `(${v.type})`
                }
                console.log(`      - ${key}: ${displayValue}`)
              }
              console.log('')
            }
          }
        }
      } catch (queryError: any) {
        console.log(`  ❌ 쿼리 오류: ${queryError.message}`)
      }
    } else {
      console.log('  ⚠️ Data Source가 없습니다.')
    }

  } catch (error: any) {
    console.error('❌ 오류 발생:')
    console.error(`  Code: ${error.code}`)
    console.error(`  Message: ${error.message}`)

    if (error.code === 'object_not_found') {
      console.error('\n💡 해결 방법:')
      console.error('  1. NOTION_DATABASE_ID가 올바른지 확인하세요.')
      console.error('  2. Notion에서 Integration에 데이터베이스 접근 권한을 부여했는지 확인하세요.')
    }
  }
}

checkDatabase()
