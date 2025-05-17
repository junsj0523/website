document.addEventListener('DOMContentLoaded', function () {
    const gamePlayLink = document.getElementById('game-play-link');
    if (!gamePlayLink) return;

    // 모달 닫기 함수 분리
    function closeModal() {
        const modal = document.getElementById('universal-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }

    // 모바일 환경 감지 함수
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    // WebGL 소프트웨어 렌더러 여부 체크 함수
    function isWebGLSoftwareRenderer() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                let renderer = '';
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo && gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)) {
                    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                } else if (gl.getParameter(gl.RENDERER)) {
                    renderer = gl.getParameter(gl.RENDERER);
                }
                console.log('[WebGL Renderer 감지]', renderer);
                return /basic render|software|microsoft|llvmpipe|swiftshader|angle/i.test(renderer);
            }
        } catch (e) { }
        return false;
    }

    // 템플릿을 활용한 모달 메시지 표시 함수
    function setModalTemplate(modalMsg, templateId) {
        modalMsg.textContent = '';
        const template = document.getElementById(templateId);
        if (template && template.content) {
            modalMsg.appendChild(template.content.cloneNode(true));
        }
    }

    // 단일 모달 템플릿 표시 함수
    function showModalTemplate(templateId, options = {}) {
        const modal = document.getElementById('universal-modal');
        const msg = document.getElementById('universal-modal-message');
        const cancelBtn = document.getElementById('universal-modal-cancel');
        const continueBtn = document.getElementById('universal-modal-continue');
        setModalTemplate(msg, templateId);
        // 버튼 텍스트/동작
        cancelBtn.textContent = options.cancelText || '창 닫기';
        cancelBtn.type = 'button';
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            if (options.onCancel) options.onCancel();
        };
        if (options.continueText) {
            continueBtn.style.display = '';
            continueBtn.textContent = options.continueText;
            continueBtn.type = 'button';
            continueBtn.onclick = () => { closeModal(); if (options.onContinue) options.onContinue(); };
        } else {
            continueBtn.style.display = 'none';
        }
        document.getElementById('universal-modal-close').onclick = closeModal;
        modal.onclick = function (e) { if (e.target === modal) closeModal(); };
        window.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') { closeModal(); window.removeEventListener('keydown', escListener); }
        });
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    gamePlayLink.addEventListener('click', async function (event) {
        event.preventDefault();
        let webgpuSupported = !!navigator.gpu;
        let webgpuAdapter = null;
        const mobile = isMobile();

        if (webgpuSupported) {
            try {
                webgpuAdapter = await navigator.gpu.requestAdapter();
            } catch (e) { }
        }
        // 분기: 우선순위대로 안내
        if (!webgpuSupported) {
            // WebGPU 미지원: 상세 안내
            showModalTemplate('webgpu-not-supported-template', {
                continueText: 'WebGL로 플레이하기',
                onContinue: function () {
                    // WebGL로 플레이하기(무시): WebGL 하드웨어 가속 확인
                    if (!mobile && isWebGLSoftwareRenderer()) {
                        showModalTemplate('webgl-no-hwaccel-template', {
                            continueText: '무시하고 플레이',
                            onContinue: function () { window.location.href = gamePlayLink.href; }
                        });
                    } else {
                        window.location.href = gamePlayLink.href;
                    }
                }
            });
            return;
        }
        if (!webgpuAdapter) {
            // WebGPU 지원, 어댑터 없음: 하드웨어 가속 안내
            showModalTemplate('webgpu-no-adapter-template', {
                continueText: '무시하고 플레이',
                onContinue: function () { window.location.href = gamePlayLink.href; }
            });
            return;
        }
        if (!mobile && isWebGLSoftwareRenderer()) {
            // (WebGPU/어댑터 여부와 무관하게) PC에서 WebGL이 소프트웨어 렌더러인 경우 경고 모달 표시
            showModalTemplate('webgl-no-hwaccel-template', {
                continueText: '무시하고 플레이',
                onContinue: function () { window.location.href = gamePlayLink.href; }
            });
            return;
        }
        // 모두 통과: 바로 게임 플레이
        window.location.href = gamePlayLink.href;
    });
});
