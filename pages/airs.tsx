import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {useEffect, useState} from "react";
import ky from "ky";
import { Air } from './api/airs'
import {Card, CardContent, Container} from "@material-ui/core";
import day from "../plugins/day"

const useFetchAir = () => {
    const [data, setData] = useState<Air[]>([]);
    const [isFetching, setIsFetching] = useState(true);

    useEffect(() => {
        ky
            .get("/api/airs")
            .json<Air[]>()
            .then((res) => {
                setData(res);
            })
            .catch((e) => {
                console.log(e);
            })
            .finally(() => {
                setIsFetching(false);
            });
    }, []);

    return {
        airs: data,
        isFetching,
    };
}
const Airs: NextPage = () => {
    const { airs, isFetching } = useFetchAir();
    if (isFetching) {
        return <p>loading...</p>;
    }
    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta name="description" content="Generated by create next app" />
                {/*<link rel="icon" href="/favicon.ico" />*/}
            </Head>
            <main>
                <Container>
                {airs.map((air) => {
                    return (
                        <Card className={"mb-4"} key={air.time}>
                            <CardContent>
                                <div>
                                    {air.co2} <br/>
                                    {air.temperature}<br/>
                                    {air.humidity}

                                </div>
                                <div key={air.time}>{
                                    day(air.time).fromNow()
                                }</div>
                            </CardContent>
                        </Card>
                    )
                })}
                </Container>
            </main>
        </div>
    )
}

export default Airs
