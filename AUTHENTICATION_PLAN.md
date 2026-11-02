# Production Login and Shared Data Plan

**Status: design plan only. Secure login is NOT connected in this prototype.**

## Proposed experience

**Club Admin**
* Creates/approves coach accounts, assigns permissions and links parents/guardians to wrestler IDs.
* Can update club contact info, Facebook URL, settings, events and approved documents.

**Coach**
* Invited by the administrator using an email address; email sign-in link or a Google account.
* Can manage roster, attendance, statistics, club practices, recurring schedules and approved announcements based on assigned role.
* May not grant themselves admin rights from the client-side app.

**Parent / Guardian**
* Invited by email and verifies account ownership through email sign-in link (or Google sign-in, if enabled).
* After a club administrator approves the parent-child relationship, the parent sees *only* their own child's private record, plus club-wide practice/event calendar, approved announcements and permitted documents.
* Supports multiple linked children and multiple verified guardians per wrestler.
* Does not edit other children's records or coach settings.

## Recommended infrastructure

1. **Hosting**: Publish the PWA over HTTPS, for example on Firebase Hosting, Netlify, or another managed hosting provider.
2. **Authentication**: Firebase Authentication using passwordless email-link sign in or Google Sign-In. Configure your own project and authorized web domains.
3. **Database**: Firestore collections for clubs, club members/roles, wrestlers, guardian relationships, events, scheduled announcements, documents, and team attendance/results. Store child profile data in private collections.
4. **Enforced security**: Firestore Security Rules must validate authenticated user ID, club membership, role, and per-wrestler guardian relationship on **every read and write**. Assign privileges only through trusted server actions/admin functions. Merely hiding the Coach controls does not provide security.
5. **Document storage**: Firebase Storage or approved Drive integration with explicit sharing permissions and server-verified access. Do not publish an unrestricted shared folder containing private wrestler data.
6. **Scheduling & notification delivery**: A scheduled backend job should publish announcements at their due time and send opt-in email/push notifications. The client-side timestamp gate in this demo is only a preview.
7. **Calendar**: A hosted iCalendar feed or a shared club-owned Google Calendar can allow parents to subscribe from Google/Apple Calendar. **Do not publish children's private information on a public calendar**. Alternatively, provide a private per-user feed with revocable access tokens. Apple/Google may refresh subscriptions at their own intervals; instantaneous synchronization cannot be guaranteed.
8. **Google Workspace integration**: Start with links to Forms, Sheets and Drive, followed by OAuth / approved API scopes and authorized imports where actually needed. Avoid requesting broad Drive access if a shareable link or Sheets export is enough.

## Suggested rollout

* **Phase 1:** Keep demo-only data and test UX with board/coaches. Establish the club's ownership and data/privacy policies.
* **Phase 2:** Set up managed hosting, Firebase project, protected database and parent/coach role security; review rules and audit behavior. Admin invite flow, account recovery and permissions should be tested before adding any real child information.
* **Phase 3:** Add scheduled backend delivery, approved document storage and subscribed live calendar.
* **Phase 4:** Invite pilot families only after security, privacy, backups, and account administration have been reviewed.

## Sources for implementation

* Firebase passwordless email links: https://firebase.google.com/docs/auth/web/email-link-auth
* Firebase role-based access via claims: https://firebase.google.com/docs/auth/admin/custom-claims
* Firebase Security Rules and Authentication: https://firebase.google.com/docs/rules/rules-and-auth
* Google Calendar public sharing and iCal subscription guidance: https://support.google.com/calendar/answer/37083

**No passwords, API keys, Firebase project configuration or secrets are included in this ZIP.**
