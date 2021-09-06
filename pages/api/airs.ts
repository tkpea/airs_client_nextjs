// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import {InfluxDB} from "@influxdata/influxdb-client";

export type Air = {
    time?: string
    co2?: number
    temperature?: number
    humidity?: number
}
export type AirsOption = {
    start?: string
    stop?: string
    every?: string
    fn?: "mean" | "avg" | "max" | "min"
}
type Data = Air[]
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    const options:AirsOption = {
        start:req.query.start as string || "-1d",
        stop:req.query.stop as string || "now()",
        every:req.query.every as string || "5m",
        fn:req.query.fn as "mean" | "avg" | "max" | "min" || "mean",
    }


    const result = await fetch(options)
    res.status(200).json(result)
}
const fetch = ({start, stop, every, fn}:AirsOption):Promise<Air[]> => {
    const token = process.env.INFLUXDB_TOKEN
    const org = process.env.INFLUXDB_ORG as string
    const client = new InfluxDB({url: process.env.INFLUXDB_URL as string, token: token})

    const queryApi = client.getQueryApi(org)
    const query = `from(bucket: "${process.env.INFLUXDB_BUCKET as string}")
        |> range(start: ${start},  stop: ${stop})
        |> filter(fn: (r) =>
            r._measurement == "airs" and
            r._field == "co2" or
            r._field == "temperature" or
            r._field == "humidity"
          )
        |> aggregateWindow(every: ${every}, fn: ${fn})
        `
    return new Promise((resolve, reject) => {
        const results: any[] = []
        queryApi.queryRows(query, {
            next(row, tableMeta) {
                const o = tableMeta.toObject(row)
                results.push(o)
            },
            error(error) {
                reject(error)
            },
            complete() {
                const airs: Air[] = []
                results.forEach(val => {
                    const field = val._field as "co2" | "temperature" | "humidity"
                    const dupulicatedTime = airs.find(v => {
                        return v.time == val._time
                    })
                    if(!dupulicatedTime) {
                        const air:Air = {
                            time: val._time
                        }
                        air[field] = val._value
                        airs.push(air)
                    } else {
                        dupulicatedTime[field] = val._value
                    }
                })

                resolve(airs)
            }
        })
    })
}
