import * as React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type CardProps = React.HTMLAttributes<HTMLDivElement>;

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm",
                className
            )}
            {...props}
        />
    )
);
Card.displayName = "Card";

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mb-4 flex flex-col space-y-1.5", className)} {...props} />
);
CardHeader.displayName = "CardHeader";

/**
 * Defaults to `h3`, which is right for a card inside a page that already has an
 * `h1`. Pages whose whole content is one card — the donor registration form,
 * the organization application — pass `as="h1"`, because otherwise their only
 * heading is an `h3` with nothing above it.
 */
const CardTitle = ({
    className,
    as: Tag = "h3",
    ...props
}: React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }) => (
    <Tag className={cn("text-xl font-bold text-neutral-900 leading-none tracking-tight", className)} {...props} />
);
CardTitle.displayName = "CardTitle";

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("", className)} {...props} />
);
CardContent.displayName = "CardContent";

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("mt-6 flex items-center", className)} {...props} />
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardContent, CardFooter };
