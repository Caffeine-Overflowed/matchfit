import {FC} from "react";

interface Props {
    text?: string
}

export const LineSeparator: FC<Props> = ({text}) => {
    return <div className="relative flex items-center justify-center">
        <hr className="w-full border-zinc-200 dark:border-zinc-800"/>
        {text &&
            <span className="absolute bg-white px-4 text-xs font-bold uppercase text-zinc-400 dark:bg-zinc-950">
                {text}
            </span>
        }
    </div>
}