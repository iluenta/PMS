#!/usr/bin/env node

/**
 * Script de Validación: Personas en Reservas
 * 
 * Este script valida que todas las personas referenciadas en las reservas
 * existan en la base de datos de personas (tabla people)
 * 
 * Uso:
 *   node scripts/validate-reservation-people.js
 *   node scripts/validate-reservation-people.js --fix
 *   node scripts/validate-reservation-people.js --stats-only
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Cargar variables de entorno desde .env.local
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim()
        if (!process.env[key]) {
          process.env[key] = value
        }
      }
    })
  }
}

loadEnvFile()

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no configuradas')
  console.error('   Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`
}

function printHeader(title) {
  console.log('\n' + '='.repeat(60))
  console.log(colorize(title, 'bright'))
  console.log('='.repeat(60))
}

function printSection(title) {
  console.log('\n' + colorize(`📋 ${title}`, 'cyan'))
  console.log('-'.repeat(40))
}

async function getValidationStats() {
  try {
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, person_id, guest, created_at')

    if (reservationsError) {
      throw reservationsError
    }

    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id')

    if (peopleError) {
      throw peopleError
    }

    const peopleIds = new Set(people.map(p => p.id))
    
    let totalReservations = reservations.length
    let withPersonId = 0
    let withoutPersonId = 0
    let validPersonReferences = 0
    let invalidPersonReferences = 0

    reservations.forEach(reservation => {
      if (reservation.person_id) {
        withPersonId++
        if (peopleIds.has(reservation.person_id)) {
          validPersonReferences++
        } else {
          invalidPersonReferences++
        }
      } else {
        withoutPersonId++
      }
    })

    const validationPercentage = withPersonId > 0 
      ? Math.round((validPersonReferences / withPersonId) * 100 * 100) / 100
      : 0

    return {
      totalReservations,
      withPersonId,
      withoutPersonId,
      validPersonReferences,
      invalidPersonReferences,
      validationPercentage
    }
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.message)
    throw error
  }
}

async function getProblematicReservations() {
  try {
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, person_id, guest, created_at')

    if (reservationsError) {
      throw reservationsError
    }

    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id')

    if (peopleError) {
      throw peopleError
    }

    const peopleIds = new Set(people.map(p => p.id))
    
    const problematic = reservations.filter(reservation => {
      return reservation.person_id && !peopleIds.has(reservation.person_id)
    })

    return problematic.map(reservation => ({
      id: reservation.id,
      person_id: reservation.person_id,
      guest_name: reservation.guest?.name || 
        `${reservation.guest?.first_name || ''} ${reservation.guest?.last_name || ''}`.trim(),
      guest_email: reservation.guest?.email,
      guest_phone: reservation.guest?.phone,
      created_at: reservation.created_at
    }))
  } catch (error) {
    console.error('❌ Error obteniendo reservas problemáticas:', error.message)
    throw error
  }
}

async function getUnlinkedReservations() {
  try {
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, person_id, guest, created_at')
      .is('person_id', null)

    if (reservationsError) {
      throw reservationsError
    }

    return reservations.map(reservation => ({
      id: reservation.id,
      guest_name: reservation.guest?.name || 
        `${reservation.guest?.first_name || ''} ${reservation.guest?.last_name || ''}`.trim(),
      guest_email: reservation.guest?.email,
      guest_phone: reservation.guest?.phone,
      created_at: reservation.created_at
    }))
  } catch (error) {
    console.error('❌ Error obteniendo reservas sin vincular:', error.message)
    throw error
  }
}

async function getPossibleLinkings() {
  try {
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('id, person_id, guest, created_at')
      .is('person_id', null)

    if (reservationsError) {
      throw reservationsError
    }

    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id, first_name, last_name, email')

    if (peopleError) {
      throw peopleError
    }

    const possibleLinkings = []

    reservations.forEach(reservation => {
      if (reservation.guest?.email) {
        const matchingPerson = people.find(person => 
          person.email === reservation.guest.email
        )
        
        if (matchingPerson) {
          possibleLinkings.push({
            reservation_id: reservation.id,
            guest_name: reservation.guest?.name || 
              `${reservation.guest?.first_name || ''} ${reservation.guest?.last_name || ''}`.trim(),
            guest_email: reservation.guest.email,
            person_id: matchingPerson.id,
            person_name: `${matchingPerson.first_name || ''} ${matchingPerson.last_name || ''}`.trim(),
            person_email: matchingPerson.email,
            created_at: reservation.created_at
          })
        }
      }
    })

    return possibleLinkings
  } catch (error) {
    console.error('❌ Error obteniendo posibles vinculaciones:', error.message)
    throw error
  }
}

async function fixInvalidPersonIds() {
  try {
    const problematic = await getProblematicReservations()
    
    if (problematic.length === 0) {
      console.log(colorize('✅ No hay person_id inválidos para corregir', 'green'))
      return
    }

    console.log(colorize(`🔧 Corrigiendo ${problematic.length} person_id inválidos...`, 'yellow'))
    
    for (const reservation of problematic) {
      const { error } = await supabase
        .from('reservations')
        .update({ person_id: null })
        .eq('id', reservation.id)

      if (error) {
        console.error(`❌ Error corrigiendo reserva ${reservation.id}:`, error.message)
      } else {
        console.log(`✅ Corregido: ${reservation.id} (${reservation.guest_name})`)
      }
    }
  } catch (error) {
    console.error('❌ Error corrigiendo person_id inválidos:', error.message)
    throw error
  }
}

async function fixPossibleLinkings() {
  try {
    const possibleLinkings = await getPossibleLinkings()
    
    if (possibleLinkings.length === 0) {
      console.log(colorize('✅ No hay vinculaciones automáticas disponibles', 'green'))
      return
    }

    console.log(colorize(`🔗 Vinculando ${possibleLinkings.length} reservas automáticamente...`, 'yellow'))
    
    for (const linking of possibleLinkings) {
      const { error } = await supabase
        .from('reservations')
        .update({ person_id: linking.person_id })
        .eq('id', linking.reservation_id)

      if (error) {
        console.error(`❌ Error vinculando reserva ${linking.reservation_id}:`, error.message)
      } else {
        console.log(`✅ Vinculado: ${linking.reservation_id} → ${linking.person_id} (${linking.guest_name})`)
      }
    }
  } catch (error) {
    console.error('❌ Error vinculando reservas:', error.message)
    throw error
  }
}

async function main() {
  const args = process.argv.slice(2)
  const fixMode = args.includes('--fix')
  const statsOnly = args.includes('--stats-only')

  try {
    printHeader('VALIDACIÓN DE PERSONAS EN RESERVAS')
    
    // 1. Estadísticas
    printSection('Estadísticas Generales')
    const stats = await getValidationStats()
    
    console.log(`📊 Total de reservas: ${colorize(stats.totalReservations, 'bright')}`)
    console.log(`🔗 Con person_id: ${colorize(stats.withPersonId, 'blue')}`)
    console.log(`⚠️  Sin person_id: ${colorize(stats.withoutPersonId, 'yellow')}`)
    console.log(`✅ Person_id válidos: ${colorize(stats.validPersonReferences, 'green')}`)
    console.log(`❌ Person_id inválidos: ${colorize(stats.invalidPersonReferences, 'red')}`)
    console.log(`📈 Porcentaje de validación: ${colorize(`${stats.validationPercentage}%`, 'bright')}`)

    if (statsOnly) {
      return
    }

    // 2. Person_id inválidos
    if (stats.invalidPersonReferences > 0) {
      printSection('Person_id Inválidos (ERRORES)')
      const problematic = await getProblematicReservations()
      
      problematic.slice(0, 10).forEach(reservation => {
        console.log(`❌ ${reservation.id}`)
        console.log(`   Person_id: ${reservation.person_id}`)
        console.log(`   Huésped: ${reservation.guest_name}`)
        console.log(`   Email: ${reservation.guest_email || 'N/A'}`)
        console.log(`   Creado: ${new Date(reservation.created_at).toLocaleDateString()}`)
        console.log('')
      })
      
      if (problematic.length > 10) {
        console.log(`... y ${problematic.length - 10} más`)
      }
    }

    // 3. Reservas sin person_id
    if (stats.withoutPersonId > 0) {
      printSection('Reservas Sin Person_id (ADVERTENCIAS)')
      const unlinked = await getUnlinkedReservations()
      
      unlinked.slice(0, 10).forEach(reservation => {
        console.log(`⚠️  ${reservation.id}`)
        console.log(`   Huésped: ${reservation.guest_name}`)
        console.log(`   Email: ${reservation.guest_email || 'N/A'}`)
        console.log(`   Teléfono: ${reservation.guest_phone || 'N/A'}`)
        console.log(`   Creado: ${new Date(reservation.created_at).toLocaleDateString()}`)
        console.log('')
      })
      
      if (unlinked.length > 10) {
        console.log(`... y ${unlinked.length - 10} más`)
      }
    }

    // 4. Posibles vinculaciones
    printSection('Posibles Vinculaciones Automáticas')
    const possibleLinkings = await getPossibleLinkings()
    
    if (possibleLinkings.length > 0) {
      possibleLinkings.slice(0, 10).forEach(linking => {
        console.log(`🔗 ${linking.reservation_id}`)
        console.log(`   Huésped: ${linking.guest_name}`)
        console.log(`   Email: ${linking.guest_email}`)
        console.log(`   Persona: ${linking.person_name} (${linking.person_id})`)
        console.log(`   Creado: ${new Date(linking.created_at).toLocaleDateString()}`)
        console.log('')
      })
      
      if (possibleLinkings.length > 10) {
        console.log(`... y ${possibleLinkings.length - 10} más`)
      }
    } else {
      console.log('✅ No hay vinculaciones automáticas disponibles')
    }

    // 5. Modo de corrección
    if (fixMode) {
      printSection('Aplicando Correcciones')
      
      if (stats.invalidPersonReferences > 0) {
        await fixInvalidPersonIds()
      }
      
      if (possibleLinkings.length > 0) {
        await fixPossibleLinkings()
      }
      
      console.log(colorize('\n✅ Correcciones aplicadas', 'green'))
    } else if (stats.invalidPersonReferences > 0 || possibleLinkings.length > 0) {
      console.log(colorize('\n💡 Usa --fix para aplicar correcciones automáticas', 'yellow'))
    }

  } catch (error) {
    console.error(colorize('\n❌ Error ejecutando validación:', 'red'))
    console.error(error.message)
    process.exit(1)
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main()
}

module.exports = {
  getValidationStats,
  getProblematicReservations,
  getUnlinkedReservations,
  getPossibleLinkings,
  fixInvalidPersonIds,
  fixPossibleLinkings
}
