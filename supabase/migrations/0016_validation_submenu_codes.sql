-- 검토·검증 하위 메뉴(AI 생성 탐지 / AI 심층검증 / 통합품질보고서) 권한 코드 시드. 멱등.
insert into public.permissions (code, name, category) values
  ('engine.validation.aidetect', 'AI 생성 탐지',   'engine'),
  ('engine.validation.deep',     'AI 심층검증',    'engine'),
  ('engine.validation.report',   '통합품질보고서', 'engine')
on conflict (code) do nothing;
