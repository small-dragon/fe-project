let requireAll = function (requireContext) {
    return requireContext.keys().map(requireContext);
}
let loadResources = function () {
    return new Promise((resolve) => {
        var tasksImg = [];
        const resource = requireAll((require.context("../images", true, /^\.\/.*\./)));
        for (var i in resource) {
            if (resource[i]) {
                var img = new Image();
                img.src = resource[i];
                tasksImg.push(img);
                $(img).on("load error", function (e) {
                    this.isload = true;
                    var isloadAll = true;
                    for (var ii in tasksImg) {
                        if (tasksImg[ii].isload != true) {
                            isloadAll = false;
                            break;
                        }
                    }
                    if (isloadAll) {
                        console.info("[resource allloaded]")
                        resolve();
                    }
                });
            }
        }
    })

}

export default {
    requireAll,
    loadResources
}