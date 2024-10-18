// Axios es una alternativa a FetchAPI, es una dependencia que se instala para JS o TS
import axios from 'axios'
import { z } from 'zod'
// import { object, string, number, Output, parse } from 'valibot'
import { SearchType } from "../Types"
import { useMemo, useState } from "react"

// Type Guards o Assertion - OPTION 2 PARA TYPESCRIPT
// function isWeatherResponse(weather: unknown): weather is Weather {
//     return (
//         Boolean(weather) &&
//         typeof weather === 'object' &&
//         typeof (weather as Weather).name === 'string' &&
//         typeof (weather as Weather).main.temp === 'number' &&
//         typeof (weather as Weather).main.temp_max === 'number' &&
//         typeof (weather as Weather).main.temp_min === 'number'
//     )
// }


// ZOD - OPTION 3 PARA TYPESCRIPT
const Weather = z.object({
    name: z.string(),
    main: z.object({
        temp: z.number(),
        temp_max: z.number(),
        temp_min: z.number()
    })
})

export type Weather = z.infer<typeof Weather>

// VALIBOT - OPTION 4 PARA TYPESCRIPT
// const WeatherSchema = object({
//     name: string(),
//     main: object({
//         temp: number(),
//         temp_max: number(),
//         temp_min: number(),
//     })
// })

// type Weather = Output<typeof WeatherSchema>


const initialState = {
    name: '',
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0
    }
}

export default function useWeather() {

    const [weather, setWeather] = useState<Weather>(initialState)
    const [loading, setLoading] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY
        setLoading(true)
        setWeather(initialState)
        try {
            const geoURL = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`
            // http://api.openweathermap.org/geo/1.0/direct?q={city name},{state code},{country code}&limit={limit}&appid={API key}
            const { data } = await axios(geoURL)

            if (!data || data.length === 0) {
                console.log('No se encontraron resultados de país o ciudad')
            }
            // Comprobar si existe
            if (!data[0]) {
                setNotFound(true)
                return
            }
            // Obtenemos los valores de latitud y longuitud de la ciudad

            const lat = data[0].lat
            const lon = data[0].lon

            const weatherURL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`
            // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

            // Castear el type - OPTION 1 PARA TYPESCRIPT
            // const { data: weatherResult } = await axios(weatherURL)
            // console.log(weatherResult.temp)
            // console.log(weatherResult.name)

            // Type Guards o Assertion - OPTION 2 PARA TYPESCRIPT
            // const { data: weatherResult } = await axios(weatherURL)
            // const result = isWeatherResponse(weatherResult)
            // if (result) {
            //     console.log('Respuesta correcta')
            // } else {
            //     console.log('Respuesta mal formada')
            // }

            // ZOD - OPTION 3 PARA TYPESCRIPT (LIBRERÍA NECESARIA DE INSTALAR E IMPORTAR)
            const { data: weatherResult } = await axios(weatherURL)
            const result = Weather.safeParse(weatherResult)
            if (result.success) {
                setWeather(result.data)
            }

            // VALIBOT - OPTION 4 PARA TYPESCRIPT (LIBRERÍA NECESARIA DE INSTALAR E IMPORTAR)
            // const { data: weatherResult } = await axios(weatherURL)
            // const result = parse(WeatherSchema, weatherResult)
            // if (result) {
            //     console.log(result.name)
            // }


        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const hasWeatherData = useMemo(() => weather.name, [weather])

    return {
        weather,
        loading,
        fetchWeather,
        hasWeatherData,
        notFound
    }
}