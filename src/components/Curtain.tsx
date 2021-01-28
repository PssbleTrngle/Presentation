import { config, Promise } from 'bluebird';
import classes from 'classnames';
import React, { useEffect, useState } from 'react';
import { Prism as Code, PrismLight as Syntax } from 'react-syntax-highlighter';
//@ts-ignore
import createElement from 'react-syntax-highlighter/create-element';
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx';
import { materialDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

Syntax.registerLanguage('tsx', tsx)

config({ cancellation: true })

const URL = 'https://raw.githubusercontent.com/PssbleTrngle/Presentation/master/src/App.tsx'

const Curtain = () => {
    const [lines, setLines] = useState<string>()

    useEffect(() => {
        const promise = Promise.resolve(fetch(URL))
            .then(r => new Promise<Response>(res => setTimeout(() => res(r), 2000)))
            .then(r => r.text())
            .then(lines => setLines(lines))

        return () => promise.cancel()
    }, [URL])

    return <>
        <section className='code'>
            {lines && <Code language='tsx' style={theme} customStyle={{ backgroundColor: 'transparent' }} renderer={Renderer}>
                {lines}
            </Code>}
        </section>
        <div className={classes('curtain', { reveal: lines })} />
    </>
}


const Renderer = (props: { rows: any[], stylesheet: any, useInlineStyles: boolean }) => {
    const { rows, stylesheet, useInlineStyles } = props

    return <>
        {rows.map((node, i) =>
            <p key={i} style={{ animationDelay: `${i * 0.007}s` }}>
                {createElement({ node, stylesheet, useInlineStyles, key: i })}
            </p>
        )}
    </>
};

export default Curtain