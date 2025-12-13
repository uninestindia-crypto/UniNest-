
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type ChartCardProps = {
    title: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    contentClassName?: string;
};

export default function ChartCard({ title, description, children, className, contentClassName }: ChartCardProps) {
    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent className={contentClassName}>
                {children}
            </CardContent>
        </Card>
    )
}
