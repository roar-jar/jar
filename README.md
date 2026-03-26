# DOEAZI Profile Site

정아람 소개 페이지를 GitHub Pages에 올릴 수 있도록 정리한 정적 사이트입니다.

## 포함 파일

- `index.html`: 메인 페이지
- `.nojekyll`: GitHub Pages에서 Jekyll 처리 없이 정적 파일 그대로 배포

## 배포 방법

1. GitHub에서 새 저장소를 만듭니다.
   - 일반 저장소 예시: `doeazi-profile-site`
   - 사용자 사이트 예시: `<github-id>.github.io`
2. 이 폴더 안의 파일만 새 저장소 루트에 올립니다.
3. 새 저장소 폴더에서 아래 명령을 실행합니다.

```bash
git init
git add .
git commit -m "Add DOEAZI profile site"
git branch -M main
git remote add origin https://github.com/<github-id>/<repo-name>.git
git push -u origin main
```

4. GitHub 저장소에서 `Settings > Pages`로 이동합니다.
5. `Build and deployment`를 `Deploy from a branch`로 설정합니다.
6. Branch는 `main`, 폴더는 `/(root)`를 선택하고 저장합니다.

## 링크 형식

- 저장소명이 `<github-id>.github.io` 인 경우
  - `https://<github-id>.github.io/`
- 일반 저장소인 경우
  - `https://<github-id>.github.io/<repo-name>/`

## 배포 전 확인할 점

- `index.html` 안의 `리멤버`, `링크드인` 버튼 링크는 현재 `#` 로 되어 있습니다.
- 실제 프로필 URL이 있으면 `href="#"` 값을 실제 링크로 바꾼 뒤 배포하는 것이 좋습니다.
