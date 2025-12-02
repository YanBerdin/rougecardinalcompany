Allowed exposed objects

One-line doc: this file lists DB objects that are intentionally granted to PUBLIC/anon/authenticated and should be ignored by the CI audit. Format: either `schema.object_name` or the pipe format used by the audit script (e.g. `relation|schema|object|role` or `function|schema|name()|role`).

Process: to add/remove an entry, open a PR describing the reason and request DB/infra approval.
