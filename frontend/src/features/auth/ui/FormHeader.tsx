import {FC} from "react";

interface Props{
    heading: string,
    supportingText: string
}

export const FormHeader: FC<Props> = ({heading, supportingText}) => {
    return <div className="text-center mb-10">
        <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-white">
            {heading}
        </h2>
        <p className="mt-3 text-zinc-500 dark:text-zinc-400">
            {supportingText}
        </p>
    </div>
}