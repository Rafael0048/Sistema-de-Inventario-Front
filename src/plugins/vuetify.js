/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com
 */

import { createVuetify } from 'vuetify'
import '@mdi/font/css/materialdesignicons.css'
import '../styles/layers.css'
import 'vuetify/styles'

export default createVuetify({
  theme: {
    defaultTheme: 'dark', 
    themes: {
      dark: {
        dark: true,
        colors: {
          
          background: '#121212', 
          surface: '#18181c',  
          primary: '#3262a8',    
          secondary: '#424242',  
          accent: '#82B1FF',
          error: '#FF5252',
          success: '#4CAF50',
          warning: '#FB8C00',
        }
      }
    }
  },
  display: {
    mobileBreakpoint: 'md',
    thresholds: {
      xs: 0,
      sm: 600,
      md: 840,
      lg: 1145,
      xl: 1545,
      xxl: 2138,
    },
  },
})
