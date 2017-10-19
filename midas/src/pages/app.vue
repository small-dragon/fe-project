<template>
    <div class="wrap">
        <transition mode="out-in" name="pagefade">
            <router-view></router-view>
        </transition>
    </div>
</template>

<style lang="less" src="../less/app.less"></style>
<script src="./app.js"></script>