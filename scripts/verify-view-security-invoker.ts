/**
 * Script de vérification : articles_presse_public SECURITY INVOKER
 * 
 * Vérifie que la vue utilise bien security_invoker = true
 * après application de la migration 20251022120000
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from '@supabase/supabase-js'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function verifyViewSecurity() {
  console.log('🔍 Vérification de la sécurité de la vue articles_presse_public\n')

  try {
    // Récupérer la définition de la vue
    const { data, error } = await supabase.rpc('pg_get_viewdef', {
      view_oid: 'public.articles_presse_public'
    })

    if (error) {
      console.error('❌ Erreur lors de la récupération de la définition:', error)
      
      // Fallback: Query directe
      console.log('\n🔄 Tentative avec query directe...\n')
      const { data: viewData, error: viewError } = await supabase
        .from('pg_views')
        .select('definition')
        .eq('schemaname', 'public')
        .eq('viewname', 'articles_presse_public')
        .single()

      if (viewError) {
        console.error('❌ Erreur fallback:', viewError)
        process.exit(1)
      }

      console.log('📄 Définition de la vue:')
      console.log(viewData.definition)
      
      if (viewData.definition.includes('security_invoker')) {
        console.log('\n✅ SECURITY INVOKER détecté dans la définition')
        console.log('✅ Fix de sécurité appliqué avec succès')
      } else {
        console.log('\n⚠️  SECURITY INVOKER NON détecté')
        console.log('⚠️  La vue peut encore utiliser SECURITY DEFINER')
      }
      
      return
    }

    console.log('📄 Définition de la vue:')
    console.log(data)
    console.log()

    // Vérifier la présence de security_invoker
    const hasSecurityInvoker = data && typeof data === 'string' 
      ? data.includes('security_invoker')
      : false

    if (hasSecurityInvoker) {
      console.log('✅ SECURITY INVOKER détecté dans la définition')
      console.log('✅ Fix de sécurité appliqué avec succès')
      console.log()
      console.log('🔐 Impact:')
      console.log('   - Requêtes exécutées avec privilèges de l\'utilisateur')
      console.log('   - Pas de privilèges superuser')
      console.log('   - Principe de moindre privilège respecté')
    } else {
      console.log('⚠️  SECURITY INVOKER NON détecté dans la définition')
      console.log('⚠️  La vue peut encore utiliser SECURITY DEFINER')
      console.log()
      console.log('🔧 Actions recommandées:')
      console.log('   1. Vérifier que la migration a été appliquée')
      console.log('   2. Exécuter: pnpm dlx supabase db push')
      console.log('   3. Relancer ce script de vérification')
    }

  } catch (error) {
    console.error('❌ Erreur inattendue:', error)
    process.exit(1)
  }
}

// Exécuter
verifyViewSecurity()
