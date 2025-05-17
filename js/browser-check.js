document.addEventListener('DOMContentLoaded', function () {
    const gamePlayLink = document.getElementById('game-play-link');
    if (!gamePlayLink) return;

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
        cancelBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            closeModal();
            if (options.onCancel) options.onCancel();
        };
        if (options.continueText) {
            continueBtn.style.display = '';
            continueBtn.textContent = options.continueText;
            continueBtn.onclick = () => { closeModal(); if (options.onContinue) options.onContinue(); };
        } else {
            continueBtn.style.display = 'none';
        }
        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
        document.getElementById('universal-modal-close').onclick = closeModal;
        modal.onclick = function (e) { if (e.target === modal) closeModal(); };
        window.addEventListener('keydown', function escListener(e) {
            if (e.key === 'Escape') { closeModal(); window.removeEventListener('keydown', escListener); }
        });
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // 모바일 환경 감지 함수
    function isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    gamePlayLink.addEventListener('click', async function (event) {
        event.preventDefault();
        // 1. WebGPU, WebGPU 어댑터, WebGL 하드웨어 가속 모두 한 번에 확인
        let webgpuSupported = !!navigator.gpu;
        let webgpuAdapter = null;
        let webglSoftwareRenderer = false;
        const mobile = isMobile();

        if (webgpuSupported) {
            try {
                webgpuAdapter = await navigator.gpu.requestAdapter();
            } catch (e) { }
        }
        // WebGL 하드웨어 가속 확인 (항상 체크, 단 모바일은 건너뜀)
        if (!mobile) {
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                if (gl) {
                    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                    if (debugInfo) {
                        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
                        webglSoftwareRenderer = /basic render|software|microsoft|llvmpipe|swiftshader|angle/i.test(renderer);
                    }
                }
            } catch (e) { }
        }

        // 분기: 우선순위대로 안내
        if (!webgpuSupported) {
            // WebGPU 미지원: 상세 안내
            showModalTemplate('webgpu-not-supported-template', {
                continueText: 'WebGL로 플레이하기',
                onContinue: function () {
                    // WebGL로 플레이하기(무시): WebGL 하드웨어 가속 확인
                    if (mobile || !webglSoftwareRenderer) {
                        window.location.href = gamePlayLink.href;
                    } else {
                        showModalTemplate('webgl-no-hwaccel-template', {
                            continueText: '무시하고 플레이',
                            onContinue: function () { window.location.href = gamePlayLink.href; }
                        });
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
        if (!mobile && webglSoftwareRenderer) {
            // WebGPU/어댑터는 있지만 WebGL 소프트웨어 렌더러(특수 상황) → 안내 (PC에서만)
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
