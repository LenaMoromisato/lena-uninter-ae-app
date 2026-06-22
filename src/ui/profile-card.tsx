import type { SessionUser } from '@features/auth/models/session';
import { Badge } from '@shadcn/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@shadcn/ui/card';
import { NavLink } from '@ui/nav-link';

type ProfileCardProps = {
  user: SessionUser;
  href?: string;
  action?: React.ReactNode;
};

function displayName(user: SessionUser) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function ProfileCard({ user, href, action }: ProfileCardProps) {
  const content = (
    <Card className="h-full transition-colors hover:border-primary/30">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-lg">{displayName(user)}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          <Badge variant="secondary">{user.role.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {user.profile?.workArea ? (
          <p>
            <span className="text-muted-foreground">Area: </span>
            {user.profile.workArea}
          </p>
        ) : null}
        {user.profile?.experienceYears != null ? (
          <p>
            <span className="text-muted-foreground">Experiencia: </span>
            {user.profile.experienceYears} anos
          </p>
        ) : null}
        {user.profile?.programmingLanguages?.length ? (
          <div className="flex flex-wrap gap-1">
            {user.profile.programmingLanguages.map((lang) => (
              <Badge key={lang} variant="outline">
                {lang}
              </Badge>
            ))}
          </div>
        ) : null}
        {action ? <div className="pt-2">{action}</div> : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <NavLink href={href} className="block h-full">
        {content}
      </NavLink>
    );
  }

  return content;
}
