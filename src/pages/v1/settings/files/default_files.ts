import { randomUUID } from "crypto";

export const getDefaultFiles = () => {
  return [
    {
      "name": "all_runners.txt",
      "template": "<loop property='runners' separator=', ' prefix=''>{runners[name]}</loop>",
      "id": ""
    },
    {
      "name": "runner_0_name.txt",
      "template": "<item property='runners' index='0'>{runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_1_name.txt",
      "template": "<item property='runners' index='1'>{runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_2_name.txt",
      "template": "<item property='runners' index='2'>{runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_3_name.txt",
      "template": "<item property='runners' index='3'>{runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_0_name+pronoun.txt",
      "template": "<item property='runners' index='0'>({runners[gender]}) {runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_1_name+pronoun.txt",
      "template": "<item property='runners' index='1'>({runners[gender]}) {runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_2_name+pronoun.txt",
      "template": "<item property='runners' index='2'>({runners[gender]}) {runners[name]}</item>",
      "id": ""
    },
    {
      "name": "runner_3_name+pronoun.txt",
      "template": "<item property='runners' index='3'>({runners[gender]}) {runners[name]}</item>",
      "id": ""
    },

    {
      "name": "all_hosts.txt",
      "template": "<loop property='hosts' separator=', ' prefix=''>{hosts[name]}</loop>",
      "id": ""
    },
    {
      "name": "host_0_name.txt",
      "template": "<item property='hosts' index='0'>{hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_1_name.txt",
      "template": "<item property='hosts' index='1'>{hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_2_name.txt",
      "template": "<item property='hosts' index='2'>{hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_3_name.txt",
      "template": "<item property='hosts' index='3'>{hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_0_name+pronoun.txt",
      "template": "<item property='hosts' index='0'>({hosts[gender]}) {hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_1_name+pronoun.txt",
      "template": "<item property='hosts' index='1'>({hosts[gender]}) {hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_2_name+pronoun.txt",
      "template": "<item property='hosts' index='2'>({hosts[gender]}) {hosts[name]}</item>",
      "id": ""
    },
    {
      "name": "host_3_name+pronoun.txt",
      "template": "<item property='hosts' index='3'>({hosts[gender]}) {hosts[name]}</item>",
      "id": ""
    },

    {
      "name": "all_commentators.txt",
      "template": "<loop property='comments' separator=', ' prefix=''>{comments[name]}</loop>",
      "id": ""
    },
    {
      "name": "commentator_0_name.txt",
      "template": "<item property='comments' index='0'>{comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_1_name.txt",
      "template": "<item property='comments' index='1'>{comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_2_name.txt",
      "template": "<item property='comments' index='2'>{comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_3_name.txt",
      "template": "<item property='comments' index='3'>{comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_0_name+pronoun.txt",
      "template": "<item property='comments' index='0'>({comments[gender]}) {comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_1_name+pronoun.txt",
      "template": "<item property='comments' index='1'>({comments[gender]}) {comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_2_name+pronoun.txt",
      "template": "<item property='comments' index='2'>({comments[gender]}) {comments[name]}</item>",
      "id": ""
    },
    {
      "name": "commentator_3_name+pronoun.txt",
      "template": "<item property='comments' index='3'>({comments[gender]}) {comments[name]}</item>",
      "id": ""
    },

    {
      "name": "full_run_title.txt",
      "id": "",
      "template": "{game} - {category} ({platform})"
    },
    {
      "name": "run_game_name.txt",
      "id": "4561e042-43f6-4e27-8050-5673c8d63cb9",
      "template": "{game}"
    },
    {
      "name": "run_category.txt",
      "id": "",
      "template": "{category}"
    },
    {
      "name": "run_platform.txt",
      "id": "",
      "template": "{platform}"
    },
    {
      "name": "run_estimate.txt",
      "id": "",
      "template": "{estimate}"
    },
  ].map((file) => {
    if (!file.id) {
      return {
        ...file,
        id: randomUUID()
      }
    }

    return file;
  })
}